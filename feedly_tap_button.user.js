// ==UserScript==
// @name           Feedly - add tap button
// @author         Koichi Masuda - koichi@masuda.sppd.ne.jp
// @namespace      http://masuda.sppd.ne.jp/misc/feedly/
// @description    Add tap buttons
// @require 　　 https://code.jquery.com/jquery-3.7.1.min.js#sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=
// @include        http://feedly.com/*
// @include        https://feedly.com/*
// @version       0.0.18
// ==/UserScript==
(function() {
    var DEFAULT_MAX_NUM_OF_TABS = 20; // it was 40;
    var MAX_ENTRIES = 100000;
    var CHECK_INTERVAL = 1000; // msec
    var REFRESH_ELEMENT_ID = ":l";
    var TAP_BUTTON_ID = "masuda_tap_button";
    var disabled_auto_nav = false;
    var trigger_mouseover_on_select = false;
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

    function fire_key_event(trigger, key, keycode) {
        // https://www.366service.com/jp/qa/96239a5ba278e91a8d08e3e664744859
        let key_event = new KeyboardEvent(trigger, {'bubbles':true,
                                                   'key': key,
                                                   'keyCode': keycode});
//        Object.defineProperty(key_event, 'charCode', {get:function(){return this.charCodeVal;}});
//        key_event.charCodeVal = keycode;
//        delete key_event.charCode;
//        delete key_event.keyCode;
//        delete key_event.keyIdentifier;
//        delete key_event.which;
//        delete key_event.key;
//        Object.defineProperties(key_event, {
//            charCode: {value: keycode},
//            keyCode: {value: keycode},
//            keyIdentifier: {value: key},
//            which: {value: keycode},
//            key: {value: 'Key'+key}
//        });
        document.body.dispatchEvent(key_event);
    }

    function add_tap_buttons() {
        var body_nodes = document.getElementsByTagName('body');
        if (!body_nodes) {
            console.log("failed to get body element");
            return;
        }
        if (body_nodes.length != 1) {
            console.log("body.length="+body_nodes.length);
            return;
        }
        var body_node = body_nodes[0];
        var tap_buttons = document.createElement('div');
        if (!tap_buttons) {
            console.log("failed to create tap_buttons");
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
            console.log("can not create k_button");
            return;
        }
        k_button.innerHTML = "k";
        k_button.style.background = "#66FF66";
//        var k_event = document.createEvent("KeyboardEvent");
//        k_event.initKeyEvent("keydown", true, true, null, false, false, false, false, 75, 0);
        k_button.onclick = function(){
            console.log("k.onclick. mimic k pressed");
            fire_key_event('keydown', 'k', KeyEvent.DOM_VK_K);
//            fire_key_event('keydown', 'p', 112);
//            fire_key_event('keypress', 'o', 111);
        };

        var j_button = document.createElement('div');
        if (!j_button) {
            console.log("can not create j_button");
            return;
        }
        j_button.innerHTML = "j";
        j_button.style.background = "#6666FF";
        j_button.onclick = function(){
            let key_event;
            console.log("j.onclick. mimic j pressed");
//            fire_key_event('keydown', 'j', 106);
            fire_key_event('keydown', 'j', KeyEvent.DOM_VK_J);
//            fire_key_event('keydown', 'n', 110);
//            fire_key_event('keypress', 'o', 111);
            return;
        };

        var n_button = document.createElement('div');
        if (!n_button) {
            console.log("can not create n_button");
            return;
        }
        n_button.innerHTML = "n";
        n_button.style.background = "#F3F781";
        n_button.onclick = function(){
            console.log("n.onclick. mimic n pressed");
            fire_key_event('keydown', 'n', KeyEvent.DOM_VK_N);
        };


        tap_buttons.appendChild(k_button);
        tap_buttons.appendChild(j_button);
        tap_buttons.appendChild(n_button);

        body_node.appendChild(tap_buttons);

    }

    function modify_leftnavdock() {
        console.log("enter modify_leftnavdock");
      //  var dock_expand_button = $(".LeftnavDock__button.LeftnavDock__peek.tertiary.button-icon-only");
      // var parent_dock = $(".Leftnav__dock.LeftnavDock");
        var dock_expand_button = $('[aria-label="Pin sidebar"], [aria-label="Hide sidebar"]');
        var parent_dock = $(".LeftnavDock");
        if (dock_expand_button.length == 1 &&
           parent_dock.length == 1) {
            if (dock_expand_button.parent() != parent_dock) {
                dock_expand_button.appendTo(parent_dock);
            }
            if (dock_expand_button.next().length != 0) {
                dock_expand_button.appendTo(parent_dock);
            }
            var parent_dock_height = parent_dock.height();
            var other_button_hieghts = 0;
            parent_dock.children().each(function (i, a_node){
                if (a_node.className != dock_expand_button[0].className){
                    other_button_hieghts += $(a_node).outerHeight();
                }
            });

            dock_expand_button.offset().top = parent_dock_height - other_button_hieghts;
            dock_expand_button.css('margin-top', 0);
            dock_expand_button.css('margin-bottom', 0);
            var padding_top = parent_dock_height - other_button_hieghts
            - Number(dock_expand_button.css('padding-bottom').replace('px', ''))
            - Number(dock_expand_button.css('border-top-width').replace('px', ''))
            - Number(dock_expand_button.css('border-bottom-width').replace('px', ''));

            dock_expand_button.css('padding-top', padding_top);

            if (!disabled_auto_nav){
                // feedlyChrome[0].addEventListener('mouseout', function(event){
                //     event.stopImmediatePropagation();
                // }, true);
                // feedlyChrome[0].addEventListener('mouseover', function(event){
                //     event.stopImmediatePropagation();
                // }, true);
                dock_expand_button[0].addEventListener('click', function(event){
                    event.stopImmediatePropagation();
                }, true);
                disabled_auto_nav = true;
            }

            let leftnav_List = $(".LeftnavList__list");
            if (leftnav_List.length == 1 && !trigger_mouseover_on_select){
                leftnav_List[0].addEventListener('click', function(event){
                    // trigger(mouseout) does not work...
                    //parent_dock.trigger("mouseout");
                    //let e = MouseEvent('mouseout');
                    //parent_dock[0].dispatchEvent(e);
                    let leftnavlist_div = $(".("LeftnavList--peeked"););
                    if (leftnavlist_div.length == 1){
                        leftnavlist_div.css("left", "-"+leftnavlist_div.css("width"));
                        leftnavlist_div.removeClass("LeftnavList--peeked");
                    }
                });
                trigger_mouseover_on_select = true;
            }
        }

        // hide tooltip
        let tooltip = $("#tooltipContainer");
        if (tooltip.length == 1){
            tooltip.hide();
        }

        // disable pin by click
        return;
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
    if (typeof KeyEvent == "undefined") {
        var KeyEvent = {
            DOM_VK_CANCEL: 3,
            DOM_VK_HELP: 6,
            DOM_VK_BACK_SPACE: 8,
            DOM_VK_TAB: 9,
            DOM_VK_CLEAR: 12,
            DOM_VK_RETURN: 13,
            DOM_VK_ENTER: 14,
            DOM_VK_SHIFT: 16,
            DOM_VK_CONTROL: 17,
            DOM_VK_ALT: 18,
            DOM_VK_PAUSE: 19,
            DOM_VK_CAPS_LOCK: 20,
            DOM_VK_ESCAPE: 27,
            DOM_VK_SPACE: 32,
            DOM_VK_PAGE_UP: 33,
            DOM_VK_PAGE_DOWN: 34,
            DOM_VK_END: 35,
            DOM_VK_HOME: 36,
            DOM_VK_LEFT: 37,
            DOM_VK_UP: 38,
            DOM_VK_RIGHT: 39,
            DOM_VK_DOWN: 40,
            DOM_VK_PRINTSCREEN: 44,
            DOM_VK_INSERT: 45,
            DOM_VK_DELETE: 46,
            DOM_VK_0: 48,
            DOM_VK_1: 49,
            DOM_VK_2: 50,
            DOM_VK_3: 51,
            DOM_VK_4: 52,
            DOM_VK_5: 53,
            DOM_VK_6: 54,
            DOM_VK_7: 55,
            DOM_VK_8: 56,
            DOM_VK_9: 57,
            DOM_VK_SEMICOLON: 59,
            DOM_VK_EQUALS: 61,
            DOM_VK_A: 65,
            DOM_VK_B: 66,
            DOM_VK_C: 67,
            DOM_VK_D: 68,
            DOM_VK_E: 69,
            DOM_VK_F: 70,
            DOM_VK_G: 71,
            DOM_VK_H: 72,
            DOM_VK_I: 73,
            DOM_VK_J: 74,
            DOM_VK_K: 75,
            DOM_VK_L: 76,
            DOM_VK_M: 77,
            DOM_VK_N: 78,
            DOM_VK_O: 79,
            DOM_VK_P: 80,
            DOM_VK_Q: 81,
            DOM_VK_R: 82,
            DOM_VK_S: 83,
            DOM_VK_T: 84,
            DOM_VK_U: 85,
            DOM_VK_V: 86,
            DOM_VK_W: 87,
            DOM_VK_X: 88,
            DOM_VK_Y: 89,
            DOM_VK_Z: 90,
            DOM_VK_CONTEXT_MENU: 93,
            DOM_VK_NUMPAD0: 96,
            DOM_VK_NUMPAD1: 97,
            DOM_VK_NUMPAD2: 98,
            DOM_VK_NUMPAD3: 99,
            DOM_VK_NUMPAD4: 100,
            DOM_VK_NUMPAD5: 101,
            DOM_VK_NUMPAD6: 102,
            DOM_VK_NUMPAD7: 103,
            DOM_VK_NUMPAD8: 104,
            DOM_VK_NUMPAD9: 105,
            DOM_VK_MULTIPLY: 106,
            DOM_VK_ADD: 107,
            DOM_VK_SEPARATOR: 108,
            DOM_VK_SUBTRACT: 109,
            DOM_VK_DECIMAL: 110,
            DOM_VK_DIVIDE: 111,
            DOM_VK_F1: 112,
            DOM_VK_F2: 113,
            DOM_VK_F3: 114,
            DOM_VK_F4: 115,
            DOM_VK_F5: 116,
            DOM_VK_F6: 117,
            DOM_VK_F7: 118,
            DOM_VK_F8: 119,
            DOM_VK_F9: 120,
            DOM_VK_F10: 121,
            DOM_VK_F11: 122,
            DOM_VK_F12: 123,
            DOM_VK_F13: 124,
            DOM_VK_F14: 125,
            DOM_VK_F15: 126,
            DOM_VK_F16: 127,
            DOM_VK_F17: 128,
            DOM_VK_F18: 129,
            DOM_VK_F19: 130,
            DOM_VK_F20: 131,
            DOM_VK_F21: 132,
            DOM_VK_F22: 133,
            DOM_VK_F23: 134,
            DOM_VK_F24: 135,
            DOM_VK_NUM_LOCK: 144,
            DOM_VK_SCROLL_LOCK: 145,
            DOM_VK_COMMA: 188,
            DOM_VK_PERIOD: 190,
            DOM_VK_SLASH: 191,
            DOM_VK_BACK_QUOTE: 192,
            DOM_VK_OPEN_BRACKET: 219,
            DOM_VK_BACK_SLASH: 220,
            DOM_VK_CLOSE_BRACKET: 221,
            DOM_VK_QUOTE: 222,
            DOM_VK_META: 224
        };
    }
})();
