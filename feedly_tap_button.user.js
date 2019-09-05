// ==UserScript==
// @name           Feedly - add tap button
// @author         Koichi Masuda - koichi@masuda.sppd.ne.jp
// @namespace      http://masuda.sppd.ne.jp/misc/feedly/
// @description    Add tap buttons
// @require 　　 https://code.jquery.com/jquery-2.0.0.min.js
// @include        http://feedly.com/*
// @include        https://feedly.com/*
// @date          2019-09-04
// @version       0.0.7
// ==/UserScript==
(function() {
    var DEFAULT_MAX_NUM_OF_TABS = 20; // it was 40;
    var MAX_ENTRIES = 100000;
    var CHECK_INTERVAL = 1000; // msec
    var REFRESH_ELEMENT_ID = ":l";
    var TAP_BUTTON_ID = "masuda_tap_button";
    var lazy_image_conversion = [
        { class_name: '', actual_src: 'data-lazy-src' },
        { class_name: 'lazy', actual_src: 'data-original' },
        { class_name: 'transform-original', actual_src: 'data-asset-url' },
        { class_name: 'transform-ku-xlarge', actual_src: 'data-asset-url' }
    ];

    // will be used...
    function getPref(key, defaultValue) {
        var value = GM_getValue(key);
        return (typeof value == 'undefined') ? defaultValue : value;
    }

    function sleep(aWait) {
        var timer = { timeup: false };

        var interval = window.setInterval(function(){
            timer.timeup = true;
        }, aWait);

        var thread = Cc["@mozilla.org/thread-manager;1"].getService().mainThread;
        while(!timer.timeup){
            thread.processNextEvent(true);
        }
        window.clearInterval(interval);
    }

    function add_tap_buttons() {
        var body_nodes = document.getElementsByTagName('body');
        if (!body_nodes) {
            GM_log("failed to get body element");
            return;
        }
        if (body_nodes.length != 1) {
            GM_log("body.length="+body_nodes.length);
            return;
        }
        var body_node = body_nodes[0];
        var tap_buttons = document.createElement('div');
        if (!tap_buttons) {
            GM_log("failed to create tap_buttons");
            return;
        }
        tap_buttons.id = TAP_BUTTON_ID;
        tap_buttons.style.visibility = "visible";
        tap_buttons.style.width = "60px";
        tap_buttons.style.bottom = "60px";
        tap_buttons.style.right = "20px";
        tap_buttons.style.position = "fixed";
        tap_buttons.style.zIndex = "999";
        tap_buttons.style.fontSize = "60px";
        tap_buttons.style.textAlign = "center";
        tap_buttons.style.cursor = "pointer";
        tap_buttons.style.opacity = "0.6";

        var k_button = document.createElement('div');
        if (!k_button) {
            GM_log("can not create k_button");
            return;
        }
        k_button.innerHTML = "k";
        k_button.style.background = "#66FF66";
//        var k_event = document.createEvent("KeyboardEvent");
//        k_event.initKeyEvent("keydown", true, true, null, false, false, false, false, 75, 0);
        k_button.onclick = function(){
//            var k_event = document.createEvent("KeyboardEvent");
//            k_event.initKeyEvent("keypress", true, true, null, false, false, false, false, 0, 107);
//            document.getElementsByTagName('body')[0].dispatchEvent(k_event);
            var k_event = new KeyboardEvent('keypress', {bubbles:true});
            Object.defineProperty(k_event, 'charCode', {get:function(){return this.charCodeVal;}});
            k_event.charCodeVal = 107;
            document.body.dispatchEvent(k_event);
        };

        var j_button = document.createElement('div');
        if (!j_button) {
            GM_log("can not create j_button");
            return;
        }
        j_button.innerHTML = "j";
        j_button.style.background = "#6666FF";
        j_button.onclick = function(){
//            var j_event = document.createEvent("KeyboardEvent");
//            j_event.initKeyEvent("keypress", true, true, null, false, false, false, false, 0, 106);
//            document.getElementsByTagName('body')[0].dispatchEvent(j_event);
            var j_event = new KeyboardEvent('keypress', {bubbles:true});
            Object.defineProperty(j_event, 'charCode', {get:function(){return this.charCodeVal;}});
            j_event.charCodeVal = 106;
            document.body.dispatchEvent(j_event);
        };

        var n_button = document.createElement('div');
        if (!n_button) {
            GM_log("can not create n_button");
            return;
        }
        n_button.innerHTML = "n";
        n_button.style.background = "#F3F781";
        n_button.onclick = function(){
//            var n_event = document.createEvent("KeyboardEvent");
//            n_event.initKeyEvent("keypress", true, true, null, false, false, false, false, 0, 110);
//            document.getElementsByTagName('body')[0].dispatchEvent(n_event);
            var n_event = new KeyboardEvent('keypress', {bubbles:true});
            Object.defineProperty(n_event, 'charCode', {get:function(){return this.charCodeVal;}});
            n_event.charCodeVal = 110;
            document.body.dispatchEvent(n_event);
        };


        tap_buttons.appendChild(k_button);
        tap_buttons.appendChild(j_button);
        tap_buttons.appendChild(n_button);

        body_node.appendChild(tap_buttons);

    }

    var dock_expand_func = function(){
        console.log("dock_expand_func fired");
        $(".LeftnavDock__button.LeftnavDock__peek.tertiary.button-icon-only").triggerHandler('click');
    }
    var move_done = false;
    function modify_leftnavdock() {
//        console.log($("#feedlyChrome__leftnav-dock-wrapper　> button.LeftnavDock__button.LeftnavDock__peek.tertiary.button-icon-only"));
//       console.log($(".LeftnavDock__button.LeftnavDock__peek.tertiary.button-icon-only").get(0).onclick);
//        console.log($(".LeftnavDock__button LeftnavDock__peek.tertiary.button-icon-only").get(0).onclick);
        if (!move_done &&
            $(".LeftnavDock__button.LeftnavDock__peek.tertiary.button-icon-only").length == 1 &&
           $(".Leftnav__dock.LeftnavDock").length == 1) {
            var dock_expand_button = $(".LeftnavDock__button.LeftnavDock__peek.tertiary.button-icon-only");
            dock_expand_button.appendTo($(".Leftnav__dock.LeftnavDock"));
             var margin_top = Number(dock_expand_button.css('margin-top').replace('px', ''));
             var margin_bottom = Number(dock_expand_button.css('margin-bottom').replace('px', ''));
             var padding_top = Number(dock_expand_button.css('padding-top').replace('px', ''));
            dock_expand_button.css('margin-top', 0);
            dock_expand_button.css('margin-bottom', 0);
            padding_top += margin_top + margin_bottom;
            dock_expand_button.css('padding-top', padding_top);
            move_done = true;
        }
        return;
        if ($(".LeftnavDock__button.LeftnavDock__peek.tertiary.button-icon-only").length == 1 &&
           $(".Leftnav__dock.LeftnavDock").length == 1) {
            var events = $._data($(".Leftnav__dock.LeftnavDock").get(0)).events;
            var added = false;
            if (events && events.click){
                $.each(events.click,function(){
                    if (this.handler == dock_expand_func) {
                        added = true;
                    }
                });
            }
            if (!added) {
                $(".Leftnav__dock.LeftnavDock").on("click", dock_expand_func);
                console.log("dock_expand_func is added to whole leftnavDock");
            }
        }
    }

    var interval_id = setInterval(
        function(){
            if (!document.getElementById(TAP_BUTTON_ID)) {
                add_tap_buttons();
            }
            modify_leftnavdock();
            var img_nodes = document.getElementsByTagName('img');
            if (img_nodes) {
                var div_nodes =  document.getElementsByClassName('gm_fullfeed_loaded');
                var div_node = div_nodes[0];
                for (var i=0; i<img_nodes.length; i++) {
                    for (var j=0; j<lazy_image_conversion.length; j++) {
                        if ((lazy_image_conversion[j].class_name === '' ||
                             img_nodes[i].className == lazy_image_conversion[j].class_name) &&
                            img_nodes[i].getAttribute(lazy_image_conversion[j].actual_src) &&
                            img_nodes[i].getAttribute(lazy_image_conversion[j].actual_src) !=
                            img_nodes[i].getAttribute("src"))   {
                            img_nodes[i].setAttribute(
                                "src",
                                img_nodes[i].getAttribute(lazy_image_conversion[j].actual_src));
                        }
                    }

                    if (div_node && img_nodes[i].width > div_node.offsetWidth) {
                        var new_height = img_nodes[i].height *
                            div_node.offsetWidth / img_nodes[i].width;
                        img_nodes[i].width = div_node.offsetWidth;
                        img_nodes[i].height = new_height;
                    }
                }
            }
        },
        CHECK_INTERVAL);

    //    window.onload = function(){
    //	if (!document.getElementById(TAP_BUTTON_ID)) {
    //	    add_tap_buttons();
    //	}
    //    };

})();
