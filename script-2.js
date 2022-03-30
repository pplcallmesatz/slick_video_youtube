
<!--    DS Video Start   -->
<script type="text/javascript">
    $(window).on("load", function () {
        $("body").css("opacity", "1");

        var realTimeClient;
        var reloadScreen = false;
        var birthday_card_size;
        var share_screen = true;
        var preview = false
        var videoPlaying = false;
        var numberOfItems = 0; 
        var numberOfItemsTwo = 0; 
        var videoPlayingTwo = false;

        //    Slick Initialise Start
        if (preview === true) {

            var sliderName = {
                slidesToShow: 1,
                slidesToScroll: 1,
                fade: false,
                pauseOnHover: false,
                autoplay: false,
                autoplaySpeed: 1000,
                arrows: true,
                draggable: true,
                infinite: false,
                prevArrow: '<button type="button" class="slick-prev"><i class="fa fa-arrow-left"></i></button>',
                nextArrow: '<button type="button" class="slick-next"><i class="fa fa-arrow-right"></i></button>',
            }
        } else {
            var sliderName = {
                slidesToShow: 1,
                slidesToScroll: 1,
                fade: false,
                pauseOnHover: false,
                autoplay: true,
                autoplaySpeed: 1000,
                arrows: false,
                draggable: false,
                infinite: true,
                prevArrow: '<button type="button" class="slick-prev"><i class="fa fa-arrow-left"></i></button>',
                nextArrow: '<button type="button" class="slick-next"><i class="fa fa-arrow-right"></i></button>',
            }
        }
        $('.item-slider').slick(
            sliderName
        );

        $('.photo-item-slider').slick(
            sliderName
        );

       $(function () {
            realTimeClient = new Faye.Client("{fayeURL}"); //https://{your domain}/faye
            realTimeClient.subscribe("{socket URL}", function (message) {
                reloadScreen = true;
                noLoop("faye");
            });
        });

      numberOfItems = $(".item-slider").find(".slick-track > *").length;
      numberOfItemsTwo = $(“.photo-item-slider").find(".slick-track > *").length;
      function noLoop(data){
        if(data === "faye"){
            if(numberOfItems <= 1 && !videoPlaying){
              browserReload();
            }
        }
        else{
	if(numberOfItems <= 1){
           onYouTubePlayer();
	}
        }
        
      }
        //    Slick Initialise End
        // background portrait and landscape changes
        portraitOrLandscape('.slick-slide');


        //Audio play Start
        var audioArray = document.getElementsByClassName("playsong");
        var i = 0;


        function loopX() {
            i = 0;
            if (typeof audioArray[i] != "undefined") {
                audioArray[i].play();
                for (i = 0; i < audioArray.length; ++i) {
                    audioArray[i].addEventListener("ended", function (e) {
                        var currentSong = e.target;
                        var next = $(currentSong).nextAll("audio");
                        if (next.length) $(next[0]).trigger("play");
                        if (next.length === 0) {
                            i = 0
                            loopX();
                        }
                    });
                }
            }
        }

        //loopX();
        //Audio play End


        function loadScript() {

            if (typeof (YT) == 'undefined' || typeof (YT.Player) == 'undefined') {
                var tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }
        }

        $(function () {
            loadScript();
        })

        function loadPlayer() {
            window.onYouTubePlayerAPIReady = function () {
                onYouTubePlayer();
                onYouTubePlayerTwo();
            };
        }

        loadPlayer();

        function onYouTubePlayer(){
            var slider = $(".item-slider");
            var prevSlide = 0,
                player,
                playing = false,
                playerRef,
                youtubeDynamicIdInt = 0;


            function slickInit(data) {
                let target = slider;
                let currentSlide = target.slick('slickCurrentSlide');
                let currentMode = checkVideoYoutubeNone(target, currentSlide);
                if (currentMode === "video") {
                    //          target.slick("slickPause");
                    let currentVideo = target.find('[data-slick-index="' + currentSlide + '"] video');
                    playVideo(target, currentVideo)
                } else if (currentMode === "youtube") {
                    playYoutube(target, currentSlide)

                } else {
                    target.slick("slickPlay");
                }
            };


            slickInit();
            // On before slide change
            slider.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                browserReload();
            });
            // On After slide change
            slider.on('afterChange', function (event, slick, currentSlide) {
                let target = $(this);
                prevSlider(target);
                let currentMode = checkVideoYoutubeNone(target, currentSlide);
                if (currentMode === "video") {
                    let currentVideo = target.find('[data-slick-index="' + currentSlide + '"] video');
                    playVideo(target, currentVideo)
                } else if (currentMode === "youtube") {
                    playYoutube(target, currentSlide)
                }
                prevSlide = currentSlide;
            });

            function prevSlider(target) {
                let prevVideo = target.find('[data-slick-index="' + prevSlide + '"] video');
                let prevYoutube = target.find('[data-slick-index="' + prevSlide + '"] iframe');
                if (prevVideo.length === 1) {
                    prevVideo.get(0).pause();
                    prevVideo.get(0).currentTime = 0;
                } else if (prevYoutube.length === 1) {
                    if (playerRef != null) {
                        postMessageToPlayer(playerRef, {
                            "event": "command",
                            "func": "stopVideo"
                        });
                    }
                }
            }

            //        Play  video tag
            function playVideo(target, videoTarget) {
                videoTarget.get(0).play();
                videoPlaying = true;
                videoTarget.on('ended', function () {
                  videoPlaying = false;  
                    noLoop("video");
                    target.slick("slickPlay");
                });
            }

            // Play Youtube video
            function playYoutube(target, currentSlide) {

                let youtubeDynamicId = "dynamicId" + youtubeDynamicIdInt;
                let frameId = target.find('[data-slick-index="' + currentSlide + '"] iframe').attr("id", youtubeDynamicId);
                let videoId = target.find('[data-slick-index="' + currentSlide + '"] iframe').attr("data-id");
                youtubeDynamicIdInt++;
                playerRef = $("#" + youtubeDynamicId).get(0);

                player = new YT.Player(youtubeDynamicId, {
                    events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onPlayerStateChange
                    }
                })
                postMessageToPlayer(playerRef, {
                    "event": "command",
                    "func": "mute"
                });

                postMessageToPlayer(playerRef, {
                    "event": "command",
                    "func": "playVideo"
                });

                function onPlayerReady(event) {
                    event.target.mute();
                    event.target.playVideo();
                }

                function onPlayerStateChange(event) {
                    if (event.data == 1 && !playing) {
                        playing = true;
                        videoPlaying = true;
                    } else if (event.data == 2 || event.data == 0) {
                        target.slick("slickPlay");
                        postMessageToPlayer(playerRef, {
                            "event": "command",
                            "func": "stopVideo"
                        });
                        videoPlaying = false;
                        noLoop("youtube")
                        player = null;
                        playing = false;
                        playerRef = null;
                    }
                }


            }

            function postMessageToPlayer(player, command) {
                if (player == null || command == null) return;
                player.contentWindow.postMessage(JSON.stringify(command), "*");
            }

            //To check current video mode
            function checkVideoYoutubeNone(target, CurrentSlide) {
                let v = target.find('[data-slick-index="' + CurrentSlide + '"] video').length,
                    y = target.find('[data-slick-index="' + CurrentSlide + '"] iframe').length;
                if (v === 1) {
                    target.slick("slickPause");
                    return "video"
                } else if (y === 1) {
                    target.slick("slickPause");
                    return "youtube"
                } else {
                    target.slick("slickPlay");
                    return "none"
                }

            }

        }

	function loopCheckTwo(){
		if(!videoPlayingTwo && numberOfItemsTwo <= 1){
			onYouTubePlayerTwo()
		}
	}

        function onYouTubePlayerTwo() {
            var sliderTwo = $(".photo-item-slider");
            var prevSlideTwo = 0,
                playerTwo,
                playingTwo = false,
                playerRefTwo,
                youtubeDynamicIdIntTwo = 0;


            function slickInitTwo() {
                let target = sliderTwo;
                let currentSlideTwo = target.slick('slickCurrentSlide');
                let currentModeTwo = checkVideoYoutubeNone(target, currentSlideTwo);
                if (currentModeTwo === "video") {
                    //          target.slick("slickPause");
                    let currentVideoTwo = target.find('[data-slick-index="' + currentSlideTwo + '"] video');
                    playVideoTwo(target, currentVideoTwo)
                } else if (currentModeTwo === "youtube") {
                    playYoutubeTwo(target, currentSlideTwo)

                } else {
                    target.slick("slickPlay");
                }
            };


            slickInitTwo();
            // On After slide change
            sliderTwo.on('afterChange', function (event, slick, currentSlide) {
                let target = $(this);
                prevSliderTwo(target);
                let currentModeTwo = checkVideoYoutubeNone(target, currentSlide);
                if (currentModeTwo === "video") {
                    let currentVideo = target.find('[data-slick-index="' + currentSlide + '"] video');
                    playVideoTwo(target, currentVideo)
                } else if (currentModeTwo === "youtube") {
                    playYoutubeTwo(target, currentSlide)
                }
                prevSlideTwo = currentSlide;
            });

            function prevSliderTwo(target) {
                let prevVideo = target.find('[data-slick-index="' + prevSlideTwo + '"] video');
                let prevYoutube = target.find('[data-slick-index="' + prevSlideTwo + '"] iframe');
                if (prevVideo.length === 1) {
                    prevVideo.get(0).pause();
                    prevVideo.get(0).currentTime = 0;
                } else if (prevYoutube.length === 1) {
                    if (playerRefTwo != null) {

                        postMessageToPlayerTwo(playerRefTwo, {
                            "event": "command",
                            "func": "stopVideo"
                        });
                    }
                }
            }

            //        Play  video tag
            function playVideoTwo(target, videoTarget) {
                videoTarget.get(0).play();
		videoPlayingTwo = true;
                videoTarget.on('ended', function () {
                    target.slick("slickPlay");
			videoPlayingTwo = false;
			loopCheckTwo();
                });
            }

            // Play Youtube video
            function playYoutubeTwo(target, currentSlide) {
                let youtubeDynamicIdTwo = "dynamicIdTwo" + youtubeDynamicIdIntTwo;

                let frameId = target.find('[data-slick-index="' + currentSlide + '"] iframe').attr("id", youtubeDynamicIdTwo);
                let videoId = target.find('[data-slick-index="' + currentSlide + '"] iframe').attr("data-id");
                youtubeDynamicIdIntTwo++;
                playerRefTwo = $("#" + youtubeDynamicIdTwo).get(0);

                playerTwo = new YT.Player(youtubeDynamicIdTwo, {
                    events: {
                        'onReady': onPlayerReadyTwo,
                        'onStateChange': onPlayerStateChangeTwo
                    }
                })
                postMessageToPlayerTwo(playerRefTwo, {
                    "event": "command",
                    "func": "mute"
                });

                postMessageToPlayerTwo(playerRefTwo, {
                    "event": "command",
                    "func": "playVideo"
                });

                function onPlayerReadyTwo(event) {
                    event.target.mute();
                    event.target.playVideo();
                }

                function onPlayerStateChangeTwo(event) {
                    if (event.data == 1 && !playingTwo) {
                        playingTwo = true;
			videoPlayingTwo = true;
                    } else if (event.data == 2 || event.data == 0) {
                        target.slick("slickPlay");
                        postMessageToPlayerTwo(playerRefTwo, {
                            "event": "command",
                            "func": "stopVideo"
                        });
			videoPlayingTwo = false;
			loopCheckTwo();
                        playerTwo = null;
                        playingTwo = false;
                        playerRefTwo = null;
                    }
                }

            }

            function postMessageToPlayerTwo(player, command) {
                if (player == null || command == null) return;
                player.contentWindow.postMessage(JSON.stringify(command), "*");
            }

            //To check current video mode
            function checkVideoYoutubeNone(target, CurrentSlide) {
                let v = target.find('[data-slick-index="' + CurrentSlide + '"] video').length,
                    y = target.find('[data-slick-index="' + CurrentSlide + '"] iframe').length;
                if (v === 1) {
                    target.slick("slickPause");
                    return "video"
                } else if (y === 1) {
                    target.slick("slickPause");
                    return "youtube"
                } else {
                    target.slick("slickPlay");
                    return "none"
                }

            }

        }

        function ajaxRefresh() {
            var reloadingFrequency = "1000";
            var params = {
                current_timing_ids: $('#current_timing_ids').val(),
                restaurant_id: 17
            };

            var last_date = new Date($('#current_date').val());
            var today = new Date;


            // TODO: yet to check what for this script
//            if (has_signage_updated == true || last_date.toJSON().slice(0, 10).replace(/-/g, '/') != today.toJSON().slice(0, 10).replace(/-/g, '/')) {
//                console.log("refresh");
//                $('.item-slider').slick('slickPause');
//                setTimeout(function() {
//                    if (share_screen == true) {
//                        location.reload(true);
//                        has_signage_updated = false;
//                    }
//                }, reloadingFrequency);
//            }

            // TODO : The below logic is to reload the page if there is any updated item is present on the DB.
            // TODO : Need to handle the timing / week cycle / date based updates for the same
            $.ajax({
                url: "/get_last_updated_time",
                method: "GET",
                data: params,
                success: function (data, textStatus, jqXHR) {
                    if (data.can_reload == true) {
                        // Pause the slideshow
                        reloadScreen = true;
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("Error");
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
            });
        }

        function browserReload() {
            if (!preview && reloadScreen) {

                window.location.reload(true);
            }
        }
    });

</script>
<!--    DS Video End   -->
