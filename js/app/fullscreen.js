// Support for full screen, created with information from: https://www.sitepoint.com/use-html5-full-screen-api/
define(function() {
    return {
        isSupported: () => {
            return document.fullscreenEnabled ||
                   document.mozFullScreenEnabled ||
                   document.webkitFullscreenEnabled ||
                   document.msFullscreenEnabled;
        },

        isActive: () => {
            return !!(document.fullscreenElement ||
                      document.mozFullScreenElement ||
                      document.webkitFullscreenElement ||
                      document.msFullscreenElement);
        },

        request: (element) => {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            } else {
                throw Error('No supported RequestFullScreen method found');
            }
        },

        exit: () => {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else {
                throw Error('No supported ExitFullScreen method found');
            }
        },

        addEventListener: (handleFullScreenChange) => {
            document.addEventListener("fullscreenchange", handleFullScreenChange);
            document.addEventListener("mozfullscreenchange", handleFullScreenChange);
            document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
            document.addEventListener("MSFullscreenChange", handleFullScreenChange);
        }
    };
});
