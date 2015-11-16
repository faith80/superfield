/**
 * File: awe-frontend-scripts.js
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function ($) {
    $(document).ready(function () {
        $('.awe-flickr').mdFlickr();
        $.each($('.awe-gmap'), function () {
            $(this).mdGMap();
        });
        $('.awe-accordion').mdAccordion();
        $('.awe-video').mdVideo();
        $('.awe-slideshow').mdSlideShow();
        $('.awe-gallery').mdGallery();
        $('.awe-image').mdImage();
        $('[data-animation]').mdProcessAnimation();
        $('.md-parallax').mdParallax();
        $('.awe-media-control').mdEventPlayer();
        $('.awe-tabs').mdTabs();
        $('.awe-section').mdEqualHeight();
        $(window).resize(function () {
            setTimeout(function () {
                $('.frame-embed').mdResizeBgVideo();
            }, 100);
        }).trigger('resize');
        $('.awesection-fullscreen').awesectionFullscreen();
    });

    $.fn.mdGMap = function (options) {
        var self = $(this),
            arrStyle = {
                style1: [{
                    "featureType": "landscape",
                    "stylers": [{"saturation": -100}, {"lightness": 65}, {"visibility": "on"}]
                }, {
                    "featureType": "poi",
                    "stylers": [{"saturation": -100}, {"lightness": 51}, {"visibility": "simplified"}]
                }, {
                    "featureType": "road.highway",
                    "stylers": [{"saturation": -100}, {"visibility": "simplified"}]
                }, {
                    "featureType": "road.arterial",
                    "stylers": [{"saturation": -100}, {"lightness": 30}, {"visibility": "on"}]
                }, {
                    "featureType": "road.local",
                    "stylers": [{"saturation": -100}, {"lightness": 40}, {"visibility": "on"}]
                }, {
                    "featureType": "transit",
                    "stylers": [{"saturation": -100}, {"visibility": "simplified"}]
                }, {"featureType": "administrative.province", "stylers": [{"visibility": "off"}]}, {
                    "featureType": "water",
                    "elementType": "labels",
                    "stylers": [{"visibility": "on"}, {"lightness": -25}, {"saturation": -100}]
                }, {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [{"hue": "#ffff00"}, {"lightness": -25}, {"saturation": -97}]
                }],
                style2: [{
                    "featureType": "water",
                    "stylers": [{"visibility": "on"}, {"color": "#acbcc9"}]
                }, {"featureType": "landscape", "stylers": [{"color": "#f2e5d4"}]}, {
                    "featureType": "road.highway",
                    "elementType": "geometry",
                    "stylers": [{"color": "#c5c6c6"}]
                }, {
                    "featureType": "road.arterial",
                    "elementType": "geometry",
                    "stylers": [{"color": "#e4d7c6"}]
                }, {
                    "featureType": "road.local",
                    "elementType": "geometry",
                    "stylers": [{"color": "#fbfaf7"}]
                }, {
                    "featureType": "poi.park",
                    "elementType": "geometry",
                    "stylers": [{"color": "#c5dac6"}]
                }, {
                    "featureType": "administrative",
                    "stylers": [{"visibility": "on"}, {"lightness": 33}]
                }, {"featureType": "road"}, {
                    "featureType": "poi.park",
                    "elementType": "labels",
                    "stylers": [{"visibility": "on"}, {"lightness": 20}]
                }, {}, {"featureType": "road", "stylers": [{"lightness": 20}]}],
                style3: [{
                    "featureType": "water",
                    "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]
                }, {"featureType": "landscape", "stylers": [{"color": "#f2f2f2"}]}, {
                    "featureType": "road",
                    "stylers": [{"saturation": -100}, {"lightness": 45}]
                }, {
                    "featureType": "road.highway",
                    "stylers": [{"visibility": "simplified"}]
                }, {
                    "featureType": "road.arterial",
                    "elementType": "labels.icon",
                    "stylers": [{"visibility": "off"}]
                }, {
                    "featureType": "administrative",
                    "elementType": "labels.text.fill",
                    "stylers": [{"color": "#444444"}]
                }, {"featureType": "transit", "stylers": [{"visibility": "off"}]}, {
                    "featureType": "poi",
                    "stylers": [{"visibility": "off"}]
                }],
                style4: [{
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [{"color": "#000000"}, {"lightness": 17}]
                }, {
                    "featureType": "landscape",
                    "elementType": "geometry",
                    "stylers": [{"color": "#000000"}, {"lightness": 20}]
                }, {
                    "featureType": "road.highway",
                    "elementType": "geometry.fill",
                    "stylers": [{"color": "#000000"}, {"lightness": 17}]
                }, {
                    "featureType": "road.highway",
                    "elementType": "geometry.stroke",
                    "stylers": [{"color": "#000000"}, {"lightness": 29}, {"weight": 0.2}]
                }, {
                    "featureType": "road.arterial",
                    "elementType": "geometry",
                    "stylers": [{"color": "#000000"}, {"lightness": 18}]
                }, {
                    "featureType": "road.local",
                    "elementType": "geometry",
                    "stylers": [{"color": "#000000"}, {"lightness": 16}]
                }, {
                    "featureType": "poi",
                    "elementType": "geometry",
                    "stylers": [{"color": "#000000"}, {"lightness": 21}]
                }, {
                    "elementType": "labels.text.stroke",
                    "stylers": [{"visibility": "on"}, {"color": "#000000"}, {"lightness": 16}]
                }, {
                    "elementType": "labels.text.fill",
                    "stylers": [{"saturation": 36}, {"color": "#000000"}, {"lightness": 40}]
                }, {"elementType": "labels.icon", "stylers": [{"visibility": "off"}]}, {
                    "featureType": "transit",
                    "elementType": "geometry",
                    "stylers": [{"color": "#000000"}, {"lightness": 19}]
                }, {
                    "featureType": "administrative",
                    "elementType": "geometry.fill",
                    "stylers": [{"color": "#000000"}, {"lightness": 20}]
                }, {
                    "featureType": "administrative",
                    "elementType": "geometry.stroke",
                    "stylers": [{"color": "#000000"}, {"lightness": 17}, {"weight": 1.2}]
                }]
            },
            data = self.data(),
            zoom = data.zoom,
            style = data.style,
            latLong = data.latlong,
            scrollZomm = parseInt(data.scrollzoom),
            info = data.info,
            iconMarker = data.marker,
            title = data.title,
            descriptions = data.descriptions,
            map, mapOptions, mapMarker, mapInfoWindow;
        if (latLong != '' && latLong.indexOf(',') != -1) {
            latLong = latLong.split(',');
            latLong = new google.maps.LatLng(latLong[0], latLong[1]);
            mapOptions = {
                zoom: zoom,
                styles: arrStyle[style],
                center: latLong,
                scrollwheel: scrollZomm ? false : true
            };
            map = new google.maps.Map(this[0], mapOptions);
            setTimeout(function () {
                google.maps.event.trigger(map, 'resize');
            }, 50);
            if (info) {
                mapMarker = new google.maps.Marker({
                    map: map,
                    title: 'Click to show info',
                    icon: iconMarker,
                    position: latLong
//                    animation: google.maps.Animation.BOUNCE
                });
                mapInfoWindow = new google.maps.InfoWindow({
                    content: (title || descriptions) ? '<h2 style="color: #333;">' + title + '</h2><p style="color: #555;">' + descriptions + '</p>' : ''
                });
                google.maps.event.addListener(mapMarker, 'click', function () {
                    mapInfoWindow.open(map, mapMarker);
                    if (mapMarker.getAnimation() != null) {
                        mapMarker.setAnimation(null);
                    } else {
                        mapMarker.setAnimation(google.maps.Animation.BOUNCE);
                    }
                });
            }
        }
    };

    $.fn.mdAccordion = function () {
        $.each(this, function () {
            var self = $(this);
            self.accordion({
                header: '>.group >h3',
                heightStyle: 'content',
                collapsible: true,
                activate: function (event, ui) {
                },
                create: function (event, ui) {
                    $(ui.header).find('.sign-toggle-accr > i').removeClass('ic ac-icon-add').addClass('ic ac-icon-minus');
                },
                beforeActivate: function (event, ui) {
                    var isToggle = parseInt(self.data('toggle')),
                        $header = ui.newHeader.length ? ui.newHeader : ui.oldHeader;

                    if (isToggle) {
                        var currHeader, currContent, isPanelSelected;

                        if (ui.newHeader[0]) {
                            currHeader = ui.newHeader;
                            currContent = currHeader.next('.ui-accordion-content');
                        }
                        else {
                            currHeader = ui.oldHeader;
                            currContent = currHeader.next('.ui-accordion-content');
                        }
                        isPanelSelected = currHeader.attr('aria-selected') == 'true';
                        currHeader.toggleClass('ui-corner-all', isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top', !isPanelSelected).attr('aria-selected', ((!isPanelSelected).toString()));
                        currHeader.children('.ui-icon').toggleClass('ui-icon-triangle-1-e', isPanelSelected).toggleClass('ui-icon-triangle-1-s', !isPanelSelected);
                        currContent.toggleClass('accordion-content-active', !isPanelSelected);
                        if (isPanelSelected) {
                            currContent.slideUp();
                            $('.sign-toggle-accr > i', currHeader).removeClass('ac-icon-minus').addClass('ac-icon-add');
                        }
                        else {
                            $('.sign-toggle-accr > i', currHeader).removeClass('ac-icon-add').addClass('ac-icon-minus');
                            currContent.slideDown();
                        }
                        return false;
                    }
                    else {
                        $('.sign-toggle-accr > i', $header.parents('.awe-item:first')).removeClass('ac-icon-minus').addClass('ac-icon-add');
                        $('.sign-toggle-accr > i', ui.newHeader).removeClass('ac-icon-add').addClass('ac-icon-minus');
                    }
                }
            })
        })
    };
    $.fn.mdVideo = function () {
        $.each(this, function () {
            var self = $(this),
                dataOptions = self.data(),
                thumb = dataOptions.thumb ? dataOptions.thumb : false,
                background = dataOptions.background ? dataOptions.background : false,
                heightVideo = dataOptions.heightvideo ? dataOptions.heightvideo : false,
                typePlay = dataOptions.typeplay ? dataOptions.typeplay : false,
                href = dataOptions.href ? dataOptions.href : '',
                $iframe = $('<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item"></iframe></div>'),
                $thumb = $('<div class="thumb-video"><div class="image-content"><img src="" alt=""/></div><div class="play-control"><i class="ic ac-icon-play"></i></div></div>'),
                $magnific = $('<a class="video-openlightbox"></a>');

            switch (typePlay) {
                case 'autoInline' :
                    $('iframe', $iframe).attr('src', href);
                    self.append($iframe);
                    break;
                case 'inline':
                    $('img', $thumb).attr('src', thumb);
                    self.append($thumb);
                    // Event for Video
                    $('.play-control', self).click(function () {
                        $('iframe', $iframe).attr('src', href);
                        self.append($iframe);
                        setTimeout(function () {
                            $thumb.hide();
                            $iframe.show();
                        }, 500)
                    });
                    break;
                case 'lightbox':
                    $('img', $thumb).attr('src', thumb);
                    $magnific.attr('href', href).magnificPopup({
                        disableOn: 700,
                        type: 'iframe',
                        mainClass: 'mfp-fade',
                        removalDelay: 160,
                        preloader: false,
                        fixedContentPos: false
                    });
                    self.append($thumb, $magnific);
                    // Event for Video
                    $('.play-control', self).click(function () {
                        $magnific.trigger('click');
                    });

                    break;
            }
        });
    };

    $.fn.mdSlideShow = function () {
        $.each(this, function () {
            var self = $(this),
                defaults = {
                    singleItem: true,
                    autoPlay: false,
                    stopOnHover: false,
                    pagination: true,
                    paginationNumbers: false,
                    navigation: false,
                    addClassActive: true,
                    transitionStyle: 'fade'

                };
            var extend = {}, options = {}, data;
            data = self.data();
            options.autoPlay = data.autoplay ? true : false;
            if (data.effect != undefined)
                options.transitionStyle = data.effect;

            // callback to get default thumbnail width
            (function getDefaultThumbWidth() {
                var thumbURL = $('.md-item-image:first', self).data('thumb'),
                    $image = $('<img src="" alt="" />').attr('src', thumbURL).css({opacity: 0, visibility: 'hidden'});

                if (thumbURL) {
                    $image.load(function() {
                        self.data('thumb-width', this.naturalWidth);
                        $('.awe-test-image').remove();
                    });

                    $('body').append($image);
                }
                else
                    self.data('thumb-width', 150);
            })();

            var getThumbWidthInterval = setInterval(function() {
                var $owlThumb;

                if (self.data('thumb-width') != undefined) {
                    clearInterval(getThumbWidthInterval);

                    // process navigation settings
                    switch (data.navigation) {
                        case 'none' :
                            options.pagination = false;
                            break;

                        case 'button' :
                            options.pagination = true;
                            options.paginationNumbers = false;
                            break;

                        case 'number' :
                            options.pagination = true;
                            options.paginationNumbers = true;
                            break;

                        case 'thumbnail' :

                            function center(number) {
                                var sync2visible = $owlThumb.data("owlCarousel").owl.visibleItems, num = number, found = false;
                                for (var i in sync2visible) {
                                    if (num === sync2visible[i])
                                        found = true;
                                }
                                if (found === false) {
                                    if (num > sync2visible[sync2visible.length - 1])
                                        $owlThumb.trigger("owl.goTo", num - sync2visible.length + 2)
                                    else {
                                        if (num - 1 === -1)
                                            num = 0;
                                        $owlThumb.trigger("owl.goTo", num);
                                    }
                                }
                                else if (num === sync2visible[sync2visible.length - 1])
                                    $owlThumb.trigger("owl.goTo", sync2visible[1])
                                else if (num === sync2visible[0])
                                    $owlThumb.trigger("owl.goTo", num - 1)
                            }
                            function syncPosition(el) {
                                var current = this.currentItem;

                                $owlThumb.find(".owl-item").removeClass("synced").eq(current).addClass("synced");
                                if ($owlThumb.data("owlCarousel") !== undefined)
                                    center(current);
                            }

                            // callback to init for slide thumbnail
                            function initThumbList($thumbList) {
                                var numberItems = Math.floor(self.width()/self.data('thumb-width')),
                                    thumbListWidth, thumbListMargin, owl;

                                if (numberItems > $('.md-item-image', self).length)
                                    numberItems = $('.md-item-image', self).length;

                                if (numberItems < 2) {
                                    numberItems = 2;
                                    thumbListWidth = '';
                                    thumbListMargin = '';
                                }
                                else {
                                    thumbListWidth = numberItems*self.data('thumb-width');
                                    thumbListMargin = (self.width() - thumbListWidth)/2;
                                }

                                if (owl = $('.owl-carousel', $thumbList).data('owlCarousel'))
                                    owl.destroy();

                                $('.list-thumb-content', $thumbList).width(thumbListWidth).css('margin-left', thumbListMargin);

                                $owlThumb = $('.owl-carousel', $thumbList).owlCarousel({
                                    pagination: false,
                                    items: numberItems,
                                    itemsDesktop: false,
                                    itemsDesktopSmall: false,
                                    itemsTablet: false,
                                    itemsMobile: false,
                                    responsiveRefreshRate: 100
                                });
                            }

                            options.pagination = false;
                            options.paginationNumbers = false;
                            options.afterAction = syncPosition;

                            var $thumb = $('<div class="owl-list-thumb"><div class="list-thumb-content owl-carousel"></div></div>');

                            $.each($('.md-item-image ', self), function () {
                                var $template = $('<div class="image-thumb"><img src="" alt=""/></div>'),
                                    srcImage = $('img', this).attr('src');

                                $('img', $template).attr('src', srcImage);
                                $('.list-thumb-content', $thumb).append($template);
                            });

                            initThumbList($thumb);

                            $owlThumb.delegate(".owl-item", "click", function (e) {
                                e.preventDefault();
                                $('.image-slide-show', self).trigger("owl.goTo", $(this).data("owlItem"));
                            });

                            // handle window resize to re-init thumb list
                            var resizeTimeOut;
                            $(window).resize(function() {
                                if (resizeTimeOut)
                                    clearTimeout(resizeTimeOut);

                                resizeTimeOut = setTimeout(function() {
                                    initThumbList($thumb);
                                }, 100);
                            });

                            // add thumb list to document
                            data.positionnav == 'top' ? self.prepend($thumb) : self.append($thumb);
                            break;
                    }

                    if (data.showcontrols)
                        options.navigation = true;

                    if (options.autoPlay) {
                        options.beforeMove = function () {
                            if ($owlThumb)
                                $owlThumb.find('.active').css({duration: ''});
                        };
                        options.afterMove = function () {
                            $('.image-slide-show', self).find('.active').css({'animation-duration': data.transspeed + 'ms'});
                        };
                        options.autoPlay = data.speed;
                    }
                    if (data.stoponhover)
                        options.stopOnHover = true;
                    options = $.extend(defaults, options);
                    $('.image-slide-show', self).owlCarousel(options);
                }
            }, 100);
        });
    };
    $.fn.mdGallery = function () {
        $.each(this, function () {
            var self = $(this);

            if (!$('.md-item-image', self).hasClass('position-over')) {
                var $images = $('li.md-item-image', self),
                    columns = self.data('items-thumb'),
                    start = 0,
                    length = $images.length;

                // reset caption height
                $('.awe-image-caption', $images).css('height', '');

                // process height caption by row
                do {
                    var $rowImages = $images.slice(start, columns),
                        maxHeight = 0;

                    start = start + columns;

                    $rowImages.each(function() {
                        var height = $('.awe-image-caption', this).height();
                        if (height > maxHeight) {
                            maxHeight = height;
                        }
                    });
                    $('.awe-image-caption', $rowImages).height(maxHeight);
                }
                while (start < length-1);
            }

            self.magnificPopup({
                delegate: '.open-lightbox',
                type: 'image',
                removalDelay: 300,
                mainClass: 'mfp-fade',
                callbacks: {
                    open: function (item, data) {
                        var $container = $('.mfp-container'),
                            $content = $('.mfp-content', $container),
                            $listThumb = $('<div class="mdf-list-thumb"><div class="thumb-content"><div class="thumb-control"></div></div></div>'),
                            $thumbContent = $('.thumb-content', $listThumb),
                            $thumbControl = $('.thumb-control', $listThumb),
                            $listImage = $('.mgf-md-popup img', self),
                            itemThumb = parseInt(self.data('items-thumb')),
                            openListThumb = this.ev.data('enable-thumb');

                        // Add Navigation for list thumbnail
                        $thumbControl.append('<i class="ic ac-icon-arrow-left gallery-prev"></i><i class="ic ac-icon-arrow-right gallery-next"></i><input type="hidden" class="gallery-trigger"/>');
                        if (!$container.next('.mdf-list-thumb').length && openListThumb == true) {
                            $.each($listImage, function (index, img) {
                                var temp = $(img).clone();
                                $('.thumb-content', $listThumb).append(temp);
                            });
                            $content.after($listThumb);
                            // Event for thumbnail
                            $thumbContent.click(function (event) {
                                event.stopPropagation();
                            });
                            $thumbContent.change(function (event, data) {
                                if (data != undefined && typeof data.index == 'number') {
                                    var indexStart = data.index;
                                    $('img', $thumbContent).removeClass('img-show');
                                    $('img', $thumbContent).eq(indexStart).addClass('active');
                                    for (var i = 0; i < itemThumb; i++) {
                                        var tempIndex = indexStart + i;
                                        $('img', $thumbContent).eq(tempIndex).addClass('img-show');
                                    }
                                    var countShow = $('img.img-show', $thumbContent).length;
                                    if (countShow < itemThumb) {
                                        for (i = 0; i < itemThumb - countShow; i++) {
                                            tempIndex = indexStart - 1 - i;
                                            $('img', $thumbContent).eq(tempIndex).addClass('img-show');
                                        }
                                    }
                                }
                            });
                            // Click image thumbnail
                            $('img', $thumbContent).click(function () {
                                var index = $(this).index() - 1;
                                $(this).addClass('active');
                                $(this).siblings('img').removeClass('active');
                                $.magnificPopup.instance.goTo(index);
                            });
                            $('.gallery-trigger', $container).change(function (event, data) {
                                event.stopPropagation();
                                if (data != undefined && typeof data.index == 'number') {
                                    var index = data.index,
                                        $target = $('img', $thumbContent).eq(index);
                                    $target.addClass('active');
                                    $target.siblings('img').removeClass('active');
                                    if (!$target.hasClass('img-show')) {
                                        $thumbContent.trigger('change', {index: index});
                                    }
                                }
                            });
                            // Navigation next event image
                            $('.gallery-next', $thumbControl).click(function () {
                                if ($('.img-show:last', $thumbContent).index() == $('img', $thumbContent).length) {
                                    $('.gallery-trigger', $container).trigger('change', {index: 0, isNav: true});
                                    $('img.active', $thumbContent).removeClass('active');
                                }
                                else {
                                    var indexStart = $('img.img-show:last', $thumbContent).index(),
                                        total = $('img', $thumbContent).length;
                                    $('img.img-show', $thumbContent).removeClass('img-show');
                                    for (var i = 0; i < itemThumb; i++) {
                                        var tempIndex = indexStart + i;
                                        $('img', $thumbContent).eq(tempIndex).addClass('img-show');
                                    }
                                    if ($('.img-show', $thumbContent).length < itemThumb) {
                                        var count = $('.img-show', $thumbContent).length,
                                            indexFirst = $('.img-show:first', $thumbContent).index() - 1;
                                        for (i = 0; i < (itemThumb - count); i++) {
                                            var index = indexFirst - i - 1;
                                            $('img', $thumbContent).eq(index).addClass('img-show');
                                        }
                                    }
                                }
                            });
                            // Navigation previous event image
                            $('.gallery-prev', $thumbControl).click(function () {
                                if ($('.img-show:first', $thumbContent).index() == 1) {
                                    var indexNew = $('img', $thumbContent).length - itemThumb;
                                    $('.gallery-trigger', $container).trigger('change', {index: indexNew, isNav: true});
                                    $('img.active', $thumbContent).removeClass('active');
                                }
                                else {
                                    var indexEnd = $('img.img-show:first', $thumbContent).index() - 2;
                                    $('img.img-show', $thumbContent).removeClass('img-show');
                                    for (var i = 0; i < itemThumb; i++) {
                                        var tempIndex = indexEnd - i;
                                        if (tempIndex >= 0 || tempIndex <= $('img', $thumbContent) - 1)
                                            $('img', $thumbContent).eq(tempIndex).addClass('img-show');
                                    }
                                    if ($('.img-show', $thumbContent).length < itemThumb) {
                                        var count = $('.img-show', $thumbContent).length,
                                            indexLast = $('.img-show:last', $thumbContent).index() - 1;
                                        for (i = 0; i < (itemThumb - count); i++) {
                                            var index = indexLast + i + 1;
                                            $('img', $thumbContent).eq(index).addClass('img-show');
                                        }
                                    }
                                }
                            });
                        }
                    },
                    change: function (item) {
                        setTimeout(function () {
                            var $container = $('.mfp-container'),
                                $content = $('.thumb-content', $container),
                                $listThumb = $('.mdf-list-thumb', $container);

                            if (!self.isOpenThumb) {
                                self.isOpenThumb = true;
                                $content.trigger('change', {index: item.index})
                            }
                            $('.gallery-trigger', $container).trigger('change', {index: item.index});
                        }, 50);
                    },
                    markupParse: function (template, values, item) {
                        var $caption = $('.awe-image-caption', item.el),
                            isEnableCaption = this.ev.attr('data-enable-caption-on-lightbox');

                        if (isEnableCaption && isEnableCaption == 'true') {
                            values.description = $('<div />').html($caption.html()).css('color', $caption.css('color'));
                        }
                        else
                            values.description = '';
                    },
                    resize: function () {

                    },
                    close: function () {
                        self.isOpenThumb = false;
                    }
                },
                gallery: {enabled: true},
                image: {
                    headerFit: true,
                    captionFit: true,
                    preserveHeaderAndCaptionWidth: false,
                    markup: '<div class="mfp-figure">\
                            <div class="mfp-img"></div>\
                            <div class="mfp-description"></div>\
                            <div class="mfp-counter"></div>\
                        </div>'
                }
            });
        });
    };
    $.fn.mdImage = function () {
        $.each(this, function () {
            var self = $(this);
            self.magnificPopup({
                delegate: '.open-lightbox',
                type: 'image',
                removalDelay: 300,
                mainClass: 'mfp-fade',
                callbacks: {
                    markupParse: function (template, values, item) {
                        var $caption = $('.awe-image-caption', item.el);

                        if ($caption.attr('data-on-lightbox') == 'true')
                            values.title = $('<div />').html($caption.html()).css('color', $caption.css('color'));
                        else
                            values.title = '';
                    }
                },
                image: {
                    headerFit: true,
                    captionFit: true,
                    preserveHeaderAndCaptionWidth: false
                }
            })
        })
    };
    $.fn.mdFlickr = function () {
        $.each(this, function () {
            var self = $(this);
            self.magnificPopup({
                delegate: '.openlightbox',
                type: 'image',
                removalDelay: 300,
                mainClass: 'mfp-fade',
                gallery: {
                    enabled: true,
                    preload: [0, 2],
                    navigateByImgClick: true
                }
            });
        });
    };
    $.fn.mdProcessAnimation = function () {
        var elements = this,
            wh = $(window).height(),
            playedElements = 0;

        $(window).scroll(function() {
            if (playedElements < elements.length) {
                $.each(elements, function (index, el) {
                    var elTop = el.getBoundingClientRect().top;

                    if (elTop < wh && !$(el).data('awecontent-anim-played')) {
                        var self = $(el),
                            dataAnimation = self.data('animation'),
                            type = dataAnimation.type,
                            duration, delay, advance, className = '', classProperty = '';

                        if (type != 'none') {
                            duration = parseInt(dataAnimation.duration);
                            delay = parseInt(dataAnimation.delay);
                            className = 'ant-' + type;
                            if (dataAnimation.advance != undefined)
                                advance = dataAnimation.advance;
                            classProperty = fnClassProperty(type, advance)
                        }
                        if (type == 'spinin') {
                            var deg = 360 * parseInt(advance.numberOfSpin);
                            deg = advance.direction == 'clockwise' ? (-deg) : deg;
                            deg = 'rotate(' + deg + 'deg)';
                            self.css({
                                '-ms-transform': deg,
                                '-webkit-transform': deg,
                                'transform': deg
                            });
                        }
                        self.css({
                            'animation-duration': duration + 'ms',
                            'animation-delay': delay + 'ms'
                        });
                        self.addClass(className + ' ' + classProperty);

                        // increase number elements played
                        $(el).data('awecontent-anim-played', 1);
                        playedElements++;
                    }
                });
            }
        }).trigger('scroll');

        function fnClassProperty(type, advance) {
            var temp = '';
            switch (type) {
                case 'floatin' :
                    temp = 'proty-dir-' + advance;
                    break;
                case 'flyin' :
                    temp = 'proty-dir-distant-' + advance;
                    break;
                case 'turnin' :
                    temp = 'proty-dir-turn-' + advance;
                    break;
            }
            return temp;
        }
    };
    $.fn.mdParallax = function () {
        $.each(this, function () {
            $(this).parallax();
        });
    };
    $.fn.mdEventPlayer = function () {
        $.each(this, function () {
            var $self = $(this),
                $iframe = $self.prevAll('iframe'),
                id = $iframe.attr('id'),
                src = $iframe.attr('src'),
                $buttonPlay = $('a', $self),
                player, typeVideo, isPlay;
            if (src.indexOf('//www.youtube.com/embed') != -1)
                typeVideo = 'youtube';
            else if (src.indexOf('//player.vimeo.com/video') != -1)
                typeVideo = 'vimeo';
            $iframe[0].onload = function () {
                if (typeVideo == 'youtube') {
                    player = new YT.Player(id, {});
                    $self.click(function () {
                        isPlay = $buttonPlay.hasClass('pause-btn') ? true : false;
                        if (isPlay) {
                            player.pauseVideo();
                            $buttonPlay.removeClass('pause-btn').addClass('play-btn');
                        }
                        else {
                            player.playVideo();
                            $buttonPlay.removeClass('play--btn').addClass('pause-btn');
                        }
                    });
                }
                else if (typeVideo == 'vimeo') {
                    player = Froogaloop($iframe[0]);
                    $self.click(function () {
                        isPlay = $buttonPlay.hasClass('pause-btn') ? true : false;
                        if (isPlay) {
                            player.api('pause');
                            $buttonPlay.removeClass('pause-btn').addClass('play-btn');
                        }
                        else {
                            player.api('play');
                            $buttonPlay.removeClass('play--btn').addClass('pause-btn');
                        }
                    });
                }
            };

        });
    };
    $.fn.mdResizeBgVideo = function () {
        $.each(this, function () {
            var $self = $(this),
                $iframe = $('iframe', $self),
                height = $self.height(),
                width = $self.width(),
                ratio = 16 / 9,
                heightIframe = $iframe.height(),
                widthIframe = $iframe.width(),
                newWidth, newHeight, exp, top = 0, left = 0;
            if (width / height > ratio) {
                newHeight = height * width / widthIframe;
                newWidth = newHeight * ratio + 50;
                top = -(newHeight - height) / 2;
            }
            else {
                newWidth = widthIframe * height / heightIframe;
                newHeight = newWidth / ratio;
                left = -(newWidth - width) / 2
            }
            $iframe.css({
                position: 'absolute',
                width: newWidth + 'px',
                height: newHeight + 'px',
                top: top + 'px',
                left: left + 'px'
            });
        });
    };
    $.fn.mdTabs = function () {
        $.each(this, function () {
            $(this).tabs();
        });
    };
    $.fn.mdEqualHeight = function () {
        $.each(this, function () {
            var equalHeight = $(this).data('equalheight');
            if (equalHeight) {
                if ($('> .container > .row > .awe-col', this).length > 1) {
                    var $listCol = $('> .container > .row > .awe-col', this),
                        maxHeight = $listCol.eq(0).height(),
                        currentHeight;
                    $.each($listCol, function () {
                        currentHeight = $(this).height();
                        if (currentHeight > maxHeight)
                            maxHeight = currentHeight;
                    });
                    $.each($listCol, function () {
                        $(this).height(maxHeight);
                    })
                }
            }
        });
    }
    $.fn.awesectionFullscreen = function () {
        var self = this;
        init();

        $(window).resize(function () {
            init();
        });
        function init() {
            var wh = $(window).height();
            $(self).height(wh);
        }

    }
})(jQuery);
