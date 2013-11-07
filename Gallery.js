var Gallery = function (evt, m, options) {
    "use strict";

    var len = options.images.length,
        cur = -1,
        curImg = null,
        walk = function (dir) {
            if (cur === -1 && dir === -1) {
                cur = 0;
            }

            cur += dir;

            if (cur === -1 || cur === len) {
                cur -= len * dir;
            }

            curImg = options.gallery.childNodes[cur].childNodes[0].childNodes[0];
            m.setThumb(curImg);

            options.gallery.parentNode.scrollTop = (curImg.offsetHeight) * cur;
            options.previewText.childNodes[0].nodeValue = options.images[cur].title;
        };

    this.render = function () {
        var i = 0,
            frag = document.createDocumentFragment(),
            li = document.createElement('li'),
            a = document.createElement('a'),
            img = document.createElement('img');

        for (i; i < len; i += 1) {
            li = li.cloneNode(false);
            a = a.cloneNode(false);
            img = img.cloneNode(false);

            a.href = options.images[i].url;
            a.title = options.images[i].title;
            img.src = options.images[i].thumb;
            img.setAttribute('data-large-img-url', options.images[i].large);
            img.className = 'img';
            img.id = 'img-' + i;

            a.appendChild(img);
            li.appendChild(a);

            frag.appendChild(li);
        }

        options.gallery.appendChild(frag);

        walk(1);

        m.attach({
            thumb: '.img',
            zoomable: true
        });
    };

    this.next = function () {
        walk(1);
    };

    this.prev = function () {
        walk(-1);
    };

    evt.attach('mousedown', options.prev, this.prev);
    evt.attach('mousedown', options.next, this.next);

    this.render();
};