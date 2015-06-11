window.onload=function(){

    document.ondragstart=new Function("return false;");
    var imgSrc1=document.getElementById('imgSrc1')
         ,imgSrc2=document.getElementById('imgSrc2')
         ,imgSrc3=document.getElementById('imgSrc3')
         ,viewImg=document.getElementById("viewImg")
         ,rightBottom=document.getElementById('right-bottom')
         ,clipbox=document.getElementById('clipbox')
         ,viewclip=document.getElementById('viewClipImg')
         ,upfile=document.getElementById('upFile')
         ,_body= (document.compatMode == 'CSS1Compact' ? document.documentElement : document.body)
         ,keyDown=false     //鼠标是否按下
         ,dragging=false    //#clipbox剪切框是否在移动
         ,diffX= 0,diffY=0    //鼠标相对于#clipbox的左上起点的距离
        ,imgW,imgH  //上传的图片的实际大小
    ;
    var
        //设置样式
        setCss=function(_this,cssOption){
            //如果_this不存在，且为文本，为注释，且他的style方法不存在
            if(!_this || _this.nodeType === 3 || _this.nodeType === 8 || !_this.style){
                return;
            }
            for(var cs in cssOption){
                _this.style[cs]=cssOption[cs];
            }
            return _this;
        },

        //改变图片时初始化一些样式
        setInitCss=function(){
            setCss(imgSrc1,{'opacity':'1'});
            setCss(clipbox,{'left':0,'top':0,'border':'none','width':'150px','height':'150px'});
            setCss(rightBottom,{'display':"none"});
            setCss(btnDiv,{'margin-top':200+'px'});
            setCss(viewclip,{'border':'none'});
            _body.scrollTop=0;
        },

        //设置大图图片父元素的宽高，即自适应大图图片大小
        loadImg=function(_imgsrc){
            var oImg=new Image();
            oImg.onload=function(){
                imgH=this.height;
                imgW=this.width;
                setCss(viewImg,{'height':imgH+'px','width':imgW+'px','border':'none'});
            };
            oImg.src=_imgsrc;
        },

        //实现实时预览上传的图片
        upViewImg=function(options){
            var _e=options.e;
            //监听改变事件
            _e.onchange=function(){
                var _v=this.value,
                    //图片正则
                    picReg=/(.JPEG|.jpeg|.JPG|.jpg|.GIF|.gif|.BMP|.bmp|.PNG|.png){1}/;
                if(!_v){
                    return false;
                }
                //图片格式是否正确，不正确则提醒
                if(!picReg.test(_v)){
                    alert("请选择正确的图片格式！");
                    return false;
                }

                //调用初始化一些样式
                setInitCss();

                //是否支持H5的FileReader API
                if(typeof FileReader == 'undefined'){   //不支持FileReader

                    if(this.file){
                        var _src=this.file.files[0].getAsDataURL();
                        imgSrc1.setAttribute('src',_src);
                        imgSrc2.setAttribute('src',_src);
                        imgSrc3.setAttribute('src',_src);
                        loadImg(_src);
                    }else{
//                        this.select();
//                        this.blur();
//                        _vv=document.selection.createRange().text;
//                        setCss(imgSrc1,{'filter':"progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='image',src=\"" + _vv + "\")"});
//                        setCss(imgSrc2,{'filter':"progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='image',src=\"" + _vv + "\")"});
//                        setCss(imgSrc3,{'filter':"progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='image',src=\"" + _vv + "\")"});
//                        //设置img的src为base64编码的透明图片，要不会显示红xx
//                        imgSrc1.setAttribute('src',"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==");
//                        imgSrc2.setAttribute('src',"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==");
//                        imgSrc3.setAttribute('src',"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==");
//                        loadImg(_vv);
                    }
                }else{
                    var reader = new FileReader(),
                        _file=this.files[0];

                    reader.onload=(function(){
                        return function(){
                            imgSrc1.setAttribute('src',this.result);
                            imgSrc2.setAttribute('src',this.result);
                            imgSrc3.setAttribute('src',this.result);
                            loadImg(this.result);
                        }
                    })();
                    reader.onerror=function(){
                        alert("文件读取出错！");
                    };
                    reader.readAsDataURL(_file); // 读取文件内容
                }
            }
        },
         //获取元素相对于屏幕的距离
        getPosition= function(node){
			var left=node.offsetLeft,
				top=node.offsetTop;
			var parent=node.offsetParent;
			while(parent != null){
				left += parent.offsetLeft;
				top += parent.offsetTop;
				parent =parent.offsetParent;
			}
			return {'left':left,'top':top};
        },
         //设置选取区域高亮显示
       setSelect= function(){
            var top=clipbox.offsetTop,
                right=clipbox.offsetLeft+clipbox.offsetWidth,
                bottom=clipbox.offsetTop+clipbox.offsetHeight,
                left=clipbox.offsetLeft;
            if((right-left)>(bottom-top)){
                right=left+bottom-top;
            }
           if((right-left)<(bottom-top)){
               bottom=top+right-left;
           }
           setCss(imgSrc2,{'clip':"rect("+top+"px "+right+"px "+bottom+"px "+left+"px)"});
       },
        //预览裁剪的图片
        preViewClip= function(){
            var top=clipbox.offsetTop,
                right=clipbox.offsetLeft+clipbox.offsetWidth,
                bottom=clipbox.offsetTop+clipbox.offsetHeight,
                left=clipbox.offsetLeft;
            //获取显示剪切图的框的宽高
            var clipW=viewclip.offsetWidth,
                clipH=viewclip.offsetHeight;
            //预览剪切框的大小与剪切出来的图片大小的比
            var scaleX= clipW/(right-left),
                scaleY=clipH/(bottom-top);
            //右边图片的实际大小
            var realW=Math.round(scaleX * imgW),
                realH=Math.round(scaleY * imgH);
            setCss(imgSrc3,{'top':Math.round(-top*scaleY)+'px','left':Math.round(-left*scaleX)+'px','width':realW+'px','height':realH+'px'});
        };

    //实时预览上传的图片
    upViewImg({
        'e':upfile
    });

    //鼠标进入#imgSrc1,显示剪切框
    imgSrc1.onmouseenter=function(e){
        if(imgSrc1.getAttribute('src')){
            setCss(imgSrc1,{'opacity':'0.6'});
            clipbox.className='clipbox';
            setCss(rightBottom,{'display':"block"});
            setCss(viewclip,{'border':'none'});
        }
    };

    //鼠标按下右下角
    rightBottom.onmousedown=function(e){
        //阻止冒泡
        if(e.stopPropagation){
            e.stopPropagation();
        }else{
            e.cancelBubble=false;
        }
        keyDown=true;
    };
    window.onmouseup=function(){
        keyDown=false;
        dragging=false;
    };

    //鼠标按下右下角移动改变剪切框大小
    window.onmousemove = function(e){
        if(keyDown == true){
            var x= e.clientX,
                y= e.clientY;
            var widthOld= clipbox.offsetWidth - 2,
                heightOld= clipbox.offsetHeight -2;
            var addW=x-getPosition(clipbox).left-widthOld,
                addH=y-getPosition(clipbox).top-heightOld + _body.scrollTop;
            var clipboxW= addW + widthOld,
                clipboxH= addH + heightOld;
           if((clipboxW+clipbox.offsetLeft)>=viewImg.offsetWidth){
               clipboxW=viewImg.offsetWidth-clipbox.offsetLeft;
           }
            if((clipboxH+clipbox.offsetTop)>=viewImg.offsetHeight){
                clipboxH=viewImg.offsetHeight-clipbox.offsetTop;
            }
            if(clipboxH>clipboxW){
                clipboxH=clipboxW;
            }
            if(clipboxH<clipboxW){
                clipboxW=clipboxH;
            }
            setCss(clipbox,{'width':clipboxW +'px','height':clipboxH +'px'});
        }
        setSelect();
        preViewClip();
    };

    //拖动#clipbox
    clipbox.onmousedown=function(e){
        if(this.className.indexOf('clipbox')>-1) {
            //开始拖动时计算diffX,diffY
            diffX = e.clientX - getPosition(clipbox).left;
            diffY = e.clientY - getPosition(clipbox).top;
            dragging = true;
        }
        //取消事件的默认行为
        if(e.preventDefault){
            e.preventDefault();
        }else{
            e.returnValue=false;
        }
    };

    //拖动过程
    clipbox.onmousemove=function(e){
        if(dragging !== false){
            var left= e.clientX-diffX-getPosition(viewImg).left,
                top= e.clientY-diffY-getPosition(viewImg).top;
            var maxLeft=parseInt(viewImg.offsetWidth)-parseInt(clipbox.offsetWidth),
                maxTop=parseInt(viewImg.offsetHeight)-parseInt(clipbox.offsetHeight);
            if(left>maxLeft){
                left=maxLeft;
            }
            if(left<0){
                left=0;
            }
            if(top>maxTop){
                top=maxTop;
            }
            if(top<0){
                top=0;
            }
            setCss(clipbox,{'left':left +'px','top':top +'px'});
            setSelect();
            preViewClip();
        }
    };
};

