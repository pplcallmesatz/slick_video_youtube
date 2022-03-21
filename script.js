   function ds(target,  currentSlide, nextSlide){
               
            let youtubeCloneCount = 0;
  postMessageToPlayer(playerTrigger, {
          "event": "command",
          "func": "stopVideo"
        })
    if(video != undefined){
        video.get(0).pause();
        video.get(0).currentTime = 0;
        video = undefined;
    }
    var videoFun = target.find('[data-slick-index="'+nextSlide+'"] video').length;
    if(videoFun === 1){
             video = target.find('[data-slick-index="'+nextSlide+'"] video');
        
        if (video != null) {
            videoLogic(target, video)
    }
    }
    
//    YouTube FUnction Starts
    var youTube = target.find('[data-slick-index="'+nextSlide+'"] iframe').length;
    if(youTube === 1){
        var cloneVar = "clone-"+youtubeCloneCount;
        target.find('[data-slick-index="'+nextSlide+'"] iframe').attr("id", cloneVar);
        var frameId = target.find('[data-slick-index="'+nextSlide+'"] iframe').attr("id");
        var videoId = target.find('[data-slick-index="'+nextSlide+'"] iframe').attr("data-id");
        youtubeFunction(target, frameId, videoId);
        youtubeCloneCount++;
    }
//            console.log(videoFun +" - "+ youTube)
//             if(videoFun !=1 && youTube != 1){
//               target.slick("slickPlay")
//           }
            
            
        }