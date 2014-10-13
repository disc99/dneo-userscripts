// ==UserScript==
// @name      desknet's Notification in Favicon
// @namespace http://to4iki.github.io/
// @description
// @version    0.1
// @match     https://dneo.rakus.co.jp/*
// ==/UserScript==

'use strict';

(function (callback) {
    var script = document.createElement("script");
    script.setAttribute("src", "//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js");
    script.addEventListener('load', function () {
        var script = document.createElement("script");
        script.textContent = "(" + callback.toString() + ")(jQuery.noConflict(true));";
        document.body.appendChild(script);
    }, false);
    document.body.appendChild(script);
})(function ($) {

    var CONST = {
        FAVICON_URL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAArNJREFUOI1NkjtvXFUURtfe59zHzNiZ8Uxm4lj4kWAMsmxAIBQKWqgo6BESBbRpUuUXUNFQoxThD0AR8aiQEIqQLJBJIqI4MbFREiATO8GO53HvOZvijiGn+orzLa2tvWXn0F799CZfbF+7uQYgIhy/ZzOAmf2Xz6y9eP3CS3wg73+9f3eZcrFdSxEFUBAQBBFAADsGHEOM/UHBrag7fu+PPxcby3PsPolEE8TZpCwTi//LmBExvEKvnrJ/+96ijyaMo3IUBBVBowMBnZhgEMuCU2GPn37eJZtq0Fs5y0w9wUzxBKGMyjiCU0VMUBQRQQwSG3LhLc/jRzW+vLwNwP0bt0neeYMYImomFDgKcxR4ChIKPKV4hkXBx68Lnbpy5eo18rkjGktG1k248eMm5eERPkYoTSlxRFO8gihECay2/mF17hTnP/uKW/tKd/UcSMJoMOD0Cc+d/hgfAgyDpxTBO4gK6qEcPuXt9YxvNrbYHtXprq6TNDpElPHTAXU/goMH+KKAvbHw9yDw5ukx763AdKYcHAXW52e4/P2vtJZWSDtdyugYFnDop5iuNTD2UDXBu0Dz8R3Orwf6jx5y9foW55Zm+Py7De6WObHVYeQdYwfBgU8hzaqteTGjPOxz74cNPnpY44mUeA/f/vIbB0mDky+8TK2Vg0BZgvegCmlabdlbWfBgYxP/XJ3RTIvZ+QWyWoKzEa0T09SaLVziCBGKoirDBGTg42iAamDqzDzthQWavTZ5rqRJJM0UdYIZhADOVZdpVgHEwDMcMbu2yLDZodFuk2aONIM8d6Rp9THGSh+qrAZeJoBed2nHT7nF52db1KcdeQ5ZBlkO2TOAcQFjB0MHIw/9v4Y085M7stu31z65wqXf72+9ok5QV82pWimrVsohQgxgsRpnvre8efFdPvwXAEwXZbFQo18AAAAASUVORK5CYII=',
        INTERVAL: 60 * 10 * 1000,
        BADGE: { UNREAD: 'red' }
    };

    var emailNotification = {
        receiveButton: $('[data-action="receive"]').find('button'),
        container: $('#mail-folder').find('.mail-folder-unread-container')[1],

        fetchMails: function () {
            var deferred = $.Deferred();
            this.receiveButton.trigger('click');
            deferred.resolve();

            return deferred.promise();
        },

        wait4Sec: function (sec) {
            var deferred = $.Deferred();
            setTimeout(function () {
                deferred.resolve();
            }, sec);

            return deferred.promise();
        },

        isUnread: function () {
            return $(this.container).css('display') === 'inline'
        },

        changeFavicon: function () {
            var that = this;
            var image = new Image();
            image.src = CONST.FAVICON_URL;

            image.onload = function () {
                var canvas = document.createElement('canvas');
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;

                var ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0);

                if (that.isUnread()) {
                    ctx.strokeStyle = '#FFF';
                    ctx.lineWidth = 2;
                    ctx.fillStyle = CONST.BADGE.UNREAD;
                    ctx.arc(canvas.width * 4 / 5, canvas.height * 4 / 5,
                        Math.min(canvas.width / 5, canvas.height / 5),
                        0, Math.PI * 2,
                        true
                    );
                    ctx.fill();
                    ctx.stroke();
                }

                var existingFaviconLink = $('link[rel="shortcut icon"]'),
                    i = 0,
                    length = existingFaviconLink.length;
                for (i, length; i < length; i++) {
                    existingFaviconLink[i].parentNode.removeChild(existingFaviconLink[i])
                }

                var newFaviconLink = document.createElement('link');
                newFaviconLink.setAttribute('rel', 'shortcut icon');
                newFaviconLink.setAttribute('href', ctx.canvas.toDataURL());
                $('head')[0].appendChild(newFaviconLink);
            }
        },

        execute: function () {
            $.when(this.fetchMails(), this.wait4Sec(3000)).then(
                function (success) {
                    emailNotification.changeFavicon();
                },
                function (error) {
                    console.log(error)
                }
            )
        }
    };

    setInterval(function () {
        emailNotification.execute();
    }, CONST.INTERVAL);
});
