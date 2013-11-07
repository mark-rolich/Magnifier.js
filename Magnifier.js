/**
* Magnifier.js is a Javascript library enabling magnifying glass effect on an images.
*
* Features
*
* Zoom in / out functionality using mouse wheel
* Attachment of user defined functions for thumbnail entering, moving and leaving and image zooming events
* Display loading text while the large image is being loaded, and switch to lens once its loaded
*
* Magnifier.js uses Event.js as a cross-browser event handling wrapper, which is available at
* Github and JSClasses.org:
*
* Github - https://github.com/mark-rolich/Event.js
* JS Classes - http://www.jsclasses.org/package/212-JavaScript-Handle-events-in-a-browser-independent-manner.html
*
* Works in Chrome, Firefox, Safari, IE 7, 8, 9 & 10.
*
* @author Mark Rolich <mark.rolich@gmail.com>
*/
var Magnifier = function (evt, options) {
    "use strict";

    var gOptions = options || {},
        curThumb = null,
        curData = {
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            lensW: 0,
            lensH: 0,
            lensBgX: 0,
            lensBgY: 0,
            largeW: 0,
            largeH: 0,
            largeL: 0,
            largeT: 0,
            zoom: 2,
            largeWrapperId: gOptions.largeWrapper.id || null,
            status: 0,
            zoomAttached: false,
            zoomable: (gOptions.zoomable !== undefined)
                ? gOptions.zoomable
                : false,
            onthumbenter: (gOptions.onthumbenter !== undefined)
                ? gOptions.onthumbenter
                : null,
            onthumbmove: (gOptions.onthumbmove !== undefined)
                ? gOptions.onthumbmove
                : null,
            onthumbleave: (gOptions.onthumbleave !== undefined)
                ? gOptions.onthumbleave
                : null,
            onzoom: (gOptions.onzoom !== undefined)
                ? gOptions.onzoom
                : null
        },
        pos = {
            t: 0,
            l: 0,
            x: 0,
            y: 0
        },
        gId = 0,
        status = 0,
        curIdx = '',
        curLens = null,
        curLarge = null,
        gZoom = (gOptions.zoom !== undefined)
                    ? gOptions.zoom
                    : curData.zoom,
        data = {},
        inBounds = false,
        createLens = function (thumb, idx) {
            var lens = document.createElement('div');

            lens.id = idx + '-lens';
            lens.className = 'magnifier-loader';

            thumb.parentNode.appendChild(lens);
        },
        updateLensOnZoom = function () {
            curLens.style.left = pos.l + 'px';
            curLens.style.top = pos.t + 'px';
            curLens.style.width = curData.lensW + 'px';
            curLens.style.height = curData.lensH + 'px';
            curLens.style.backgroundPosition = '-' + curData.lensBgX + 'px -' +
                                                curData.lensBgY + 'px';

            curLarge.style.left = '-' + curData.largeL + 'px';
            curLarge.style.top = '-' + curData.largeT + 'px';
            curLarge.style.width = curData.largeW + 'px';
            curLarge.style.height = curData.largeH + 'px';
        },
        updateLensOnLoad = function (idx, thumb, large, largeWrapper) {
            var lens = document.getElementById(idx + '-lens'),
                textWrapper = null;

            if (data[idx].status === 1) {
                textWrapper = document.createElement('div');
                textWrapper.className = 'magnifier-loader-text';
                lens.className = 'magnifier-loader hidden';

                textWrapper.appendChild(document.createTextNode('Loading...'));
                lens.appendChild(textWrapper);
            } else if (data[idx].status === 2) {
                lens.className = 'magnifier-lens hidden';
                lens.removeChild(lens.childNodes[0]);
                lens.style.background = 'url(' + thumb.src + ') no-repeat 0 0 scroll';

                large.id = idx + '-large';
                large.style.width = data[idx].largeW + 'px';
                large.style.height = data[idx].largeH + 'px';
                large.className = 'magnifier-large hidden';

                largeWrapper.appendChild(large);
            }

            lens.style.width = data[idx].lensW + 'px';
            lens.style.height = data[idx].lensH + 'px';
        },
        getMousePos = function () {
            var xPos = pos.x - curData.x,
                yPos = pos.y - curData.y,
                t    = 0,
                l    = 0;

            inBounds = (
                xPos < 0 ||
                yPos < 0 ||
                xPos > curData.w ||
                yPos > curData.h
            )
                ? false
                : true;

            l = xPos - (curData.lensW / 2);
            t = yPos - (curData.lensH / 2);

            if (xPos < curData.lensW / 2) {
                l = 0;
            }

            if (yPos < curData.lensH / 2) {
                t = 0;
            }

            if (xPos - curData.w + (curData.lensW / 2) > 0) {
                l = curData.w - (curData.lensW + 2);
            }

            if (yPos - curData.h + (curData.lensH / 2) > 0) {
                t = curData.h - (curData.lensH + 2);
            }

            pos.l = Math.round(l);
            pos.t = Math.round(t);

            curData.lensBgX = pos.l + 1;
            curData.lensBgY = pos.t + 1;

            curData.largeL = Math.round(curData.lensBgX * curData.zoom * (curData.largeWrapperW / curData.w));
            curData.largeT = Math.round(curData.lensBgY * curData.zoom * (curData.largeWrapperH / curData.h));
        },
        zoomInOut = function (e) {
            var delta = (e.wheelDelta > 0 || e.detail < 0) ? 0.1 : -0.1,
                handler = curData.onzoom;

            if (e.preventDefault) {
                e.preventDefault();
            }

            e.returnValue = false;

            curData.zoom = Math.round((curData.zoom + delta) * 10) / 10;

            if (curData.zoom >= 1.1) {
                curData.lensW = Math.round(curData.w / curData.zoom);
                curData.lensH = Math.round(curData.h / curData.zoom);

                curData.largeW = Math.round(curData.zoom * curData.largeWrapperW);
                curData.largeH = Math.round(curData.zoom * curData.largeWrapperH);

                getMousePos();
                updateLensOnZoom();

                if (handler !== null) {
                    handler({
                        thumb: curThumb,
                        lens: curLens,
                        large: curLarge,
                        x: pos.x,
                        y: pos.y,
                        zoom: Math.round(curData.zoom * (curData.largeWrapperW / curData.w) * 10) / 10,
                        w: curData.lensW,
                        h: curData.lensH
                    });
                }

            } else {
                curData.zoom = 1.1;
            }
        },
        onThumbEnter = function () {
            curData = data[curIdx];
            curLens = document.getElementById(curIdx + '-lens');

            if (curData.status === 2) {
                curLens.className = 'magnifier-lens';

                if (curData.zoomAttached === false) {
                    if (curData.zoomable !== undefined && curData.zoomable === true) {
                        evt.attach('mousewheel', curLens, zoomInOut);

                        if (window.addEventListener) {
                            curLens.addEventListener('DOMMouseScroll', function (e) {
                                zoomInOut(e);
                            });
                        }
                    }

                    curData.zoomAttached = true;
                }

                curLarge = document.getElementById(curIdx + '-large');
                curLarge.className = 'magnifier-large';
            } else if (curData.status === 1) {
                curLens.className = 'magnifier-loader';
            }
        },
        onThumbLeave = function () {
            if (curData.status > 0) {
                var handler = curData.onthumbleave;

                if (handler !== null) {
                    handler({
                        thumb: curThumb,
                        lens: curLens,
                        large: curLarge,
                        x: pos.x,
                        y: pos.y
                    });
                }

                curLens.className += ' hidden';
                curThumb.className = curData.thumbCssClass;

                if (curLarge !== null) {
                    curLarge.className += ' hidden';
                }
            }
        },
        move = function () {
            if (status !== curData.status) {
                onThumbEnter();
            }

            if (curData.status > 0) {
                curThumb.className = curData.thumbCssClass + ' opaque';

                if (curData.status === 1) {
                    curLens.className = 'magnifier-loader';
                } else if (curData.status === 2) {
                    curLens.className = 'magnifier-lens';
                    curLarge.className = 'magnifier-large';
                    curLarge.style.left = '-' + curData.largeL + 'px';
                    curLarge.style.top = '-' + curData.largeT + 'px';
                }

                curLens.style.left = pos.l + 'px';
                curLens.style.top = pos.t + 'px';
                curLens.style.backgroundPosition = '-' +
                                                curData.lensBgX + 'px -' +
                                                curData.lensBgY + 'px';

                var handler = curData.onthumbmove;

                if (handler !== null) {
                    handler({
                        thumb: curThumb,
                        lens: curLens,
                        large: curLarge,
                        x: pos.x,
                        y: pos.y
                    });
                }
            }

            status = curData.status;
        },
        setThumbData = function (thumb, thumbData) {
            var thumbBounds = thumb.getBoundingClientRect();

            thumbData.x = thumbBounds.left;
            thumbData.y = thumbBounds.top;
            thumbData.w = Math.round(thumbBounds.right - thumbData.x);
            thumbData.h = Math.round(thumbBounds.bottom - thumbData.y);

            thumbData.lensW = Math.round(thumbData.w / thumbData.zoom);
            thumbData.lensH = Math.round(thumbData.h / thumbData.zoom);

            thumbData.largeW = Math.round(thumbData.zoom * thumbData.largeWrapperW);
            thumbData.largeH = Math.round(thumbData.zoom * thumbData.largeWrapperH);
        };

    this.attach = function (options) {
        if (options.thumb === undefined) {
            throw {
                name: 'Magnifier error',
                message: 'Please set thumbnail dom object',
                toString: function () {return this.name + ": " + this.message; }
            };
        }

        if (options.large === undefined) {
            throw {
                name: 'Magnifier error',
                message: 'Please set large image url',
                toString: function () {return this.name + ": " + this.message; }
            };
        }

        if (data[options.thumb.id] !== undefined) {
            curThumb = options.thumb;
            return false;
        }

        var thumbObj    = new Image(),
            largeObj    = new Image(),
            thumb       = options.thumb,
            idx         = thumb.id,
            zoomable    = null,
            largeWrapper = (
                options.largeWrapper ||
                document.getElementById(curData.largeWrapperId)
            ),
            zoom = options.zoom || gZoom,
            onthumbenter = (options.onthumbenter !== undefined)
                        ? options.onthumbenter
                        : curData.onthumbenter,
            onthumbleave = (options.onthumbleave !== undefined)
                        ? options.onthumbleave
                        : curData.onthumbleave,
            onthumbmove = (options.onthumbmove !== undefined)
                        ? options.onthumbmove
                        : curData.onthumbmove,
            onzoom = (options.onzoom !== undefined)
                        ? options.onzoom
                        : curData.onzoom;

        if (largeWrapper === null) {
            throw {
                name: 'Magnifier error',
                message: 'Please specify large image wrapper DOM element',
                toString: function () {return this.name + ": " + this.message; }
            };
        }

        if (options.zoomable !== undefined) {
            zoomable = options.zoomable;
        } else if (curData.zoomable !== undefined) {
            zoomable = curData.zoomable;
        }

        if (thumb.id === '') {
            idx = thumb.id = 'magnifier-item-' + gId;
            gId += 1;
        }

        createLens(thumb, idx);

        data[idx] = {
            zoom: zoom,
            zoomable: zoomable,
            thumbCssClass: thumb.className,
            zoomAttached: false,
            status: 0,
            largeWrapperId: largeWrapper.id,
            largeWrapperW: largeWrapper.offsetWidth,
            largeWrapperH: largeWrapper.offsetHeight,
            onzoom: onzoom,
            onthumbenter: onthumbenter,
            onthumbleave: onthumbleave,
            onthumbmove: onthumbmove
        };

        evt.attach('mouseover', thumb, function (e, src) {
            if (curData.status !== 0) {
                onThumbLeave();
            }

            curIdx = src.id;
            curThumb = src;

            onThumbEnter(src);

            setThumbData(curThumb, curData);

            pos.x = e.clientX;
            pos.y = e.clientY;

            getMousePos();
            move();

            var handler = curData.onthumbenter;

            if (handler !== null) {
                handler({
                    thumb: curThumb,
                    lens: curLens,
                    large: curLarge,
                    x: pos.x,
                    y: pos.y
                });
            }
        }, false);

        evt.attach('load', thumbObj, function () {
            data[idx].status = 1;

            setThumbData(thumb, data[idx]);
            updateLensOnLoad(idx);

            evt.attach('load', largeObj, function () {
                data[idx].status = 2;
                updateLensOnLoad(idx, thumb, largeObj, largeWrapper);
            });

            largeObj.src = options.large;
        });

        thumbObj.src = thumb.src;
    };

    evt.attach('mousemove', document, function (e) {
        pos.x = e.clientX;
        pos.y = e.clientY;

        getMousePos();

        if (inBounds === true) {
            move();
        } else {
            onThumbLeave();
        }
    });

    evt.attach('scroll', window, function () {
        if (curThumb !== null) {
            setThumbData(curThumb, curData);
        }
    });
};