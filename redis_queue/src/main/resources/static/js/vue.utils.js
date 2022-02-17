
//util
(function() {

    //$moment.defaultFormat = 'YYYY.MM.DD';

    var util = {};

    /**********
     * format *
     **********/

    // 배열의 property의 합을 구함
    util.sumProp = function(arr, prop) {
        return arr.reduce(function(a, b) {
            return a + (b[prop] || 0);
        }, 0);
    };
    /*
    util.getByteLength = function(s, b  i, c) {
        for (b = i = 0; c = s.charCodeAt(i++); b += c >> 11 ? 3 : c >> 7 ? 2 : 1);
        return b;
    };
    */
    util.getByteLength = function(s) {
        if (s == null || s.length == 0) {
            return 0;
        }
        var size = 0;
        for (var i = 0; i < s.length; i++) {
            size += this.charByteSize(s.charAt(i));
        }
        return size;
    };
    util.cutByteLength = function(s, len) {
        if (s == null || s.length == 0) {
            return '';
        }
        var size = 0;
        var rIndex = s.length;
        for (var i = 0; i < s.length; i++) {
            size += this.charByteSize(s.charAt(i));
            if (size == len) {
                rIndex = i + 1;
                break;
            } else if (size > len) {
                rIndex = i;
                break;
            }
        }
        return s.substring(0, rIndex);
    };
    util.charByteSize = function(ch) {
        if (ch == null || ch.length == 0) {
            return 0;
        }
        var charCode = ch.charCodeAt(0);
        if (charCode <= 0x00007F) {
            return 1;
        } else if (charCode <= 0x0007FF) {
            return 2;
        } else if (charCode <= 0x00FFFF) {
            // return 3;
            return 2;
        } else {
            // return 4;
            return 2;
        }
    };

    util.format = {
        number: function(n, dec, dsep, tsep) {
            if (isNaN(n) || n == null || n === '')
                return 0;

            n = Number(n).toFixed(~~dec);
            tsep = typeof tsep == 'string' ? tsep : ',';

            var parts = n.split('.'), fnums = parts[0], decimals = parts[1] ? (dsep || '.') + parts[1] : '';

            return fnums.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + tsep) + decimals;
        },
        date: function(d) {
            return moment(d).format();
        },
        intUnsigned: function(p) {
            var n = p.toString().replace(/[^0-9]/g, '');
            if (n == null || n === '' || isNaN(n))
                return 0;
            n = Number(n);
            if (n < 0)
                return 0;
            else
                return n;
        },
        unescape: function(s) {
            if (s == null) {
                return '';
            }
            return s;
            //return Master.ConvertSystemSourcetoHtml(s);
        },
        ellipsis: function(s, n) {
            if (s == null)
                return '';

            var str = '';
            var i = 0;
            for (var k = 0; k < s.length; k++) {
                if (escape(s.charAt(k)).length > 4) {
                    i += 2
                } else {
                    i++;
                }
                if (i <= n) {
                    str += escape(s.charAt(k));
                } else {
                    return unescape(str) + '...';
                }
            }
            return unescape(str);
        }
    };

    util.isJSONObject = function(s) {
        var b = false;
        if (typeof s == 'string') {
            try {
                var obj = JSON.parse(s);
                if (typeof obj == 'object') {
                    b = true;
                }
            } catch (e) {
                console.log(e);
            }
        }
        return b;
    };

    util.ajax = function(url, options, successCallback, errorCallback, completeCallback) {

        var opt = $.extend({}, {
            context: this,
            cache: false,
            method: 'POST',
            timeout: 20000,
            traditional: true,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Ajax", "true");
            }
        }, options);

        $.ajax(url, opt).done(function(data, textStatus, jqXHR) {
            if (jqXHR.getResponseHeader("X-Invalid-Session") == "true") {

                util._tempAjaxReturnUrl = document.location.pathname.replace("/shop", "") + document.location.search;
            } else if (typeof successCallback == 'function') {
                if (url.indexOf("/goods/userWish.json") > -1) {
                    if (data.resultValue == "0") {
                        try {
                            if (data.myWishList) {
                                localStorage.setItem("myWishList", JSON.stringify(data.myWishList));
                            } else {
                                localStorage.setItem("myWishList", "[]");
                            }
                        } catch (e) {
                            localStorage.setItem("myWishList", "[]");
                        }
                    }
                }
                successCallback(data, textStatus, jqXHR)
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            // console.log('fail');
            if (jqXHR.status == '901') { // 로그인 세션 만료
                util._tempAjaxReturnUrl = document.location.pathname.replace("/shop", "") + document.location.search;
                return;
            } else if (jqXHR.status == '902') { // 메뉴 권한 없음(사용 안함)
                //				util.goHome();
                return;
            } else if (jqXHR.status == '903') { // 프로그램 권한 없음
                //				alert(Msg.error.programAuth);
                //				util.goHome();
                return;
            }
            if (typeof errorCallback == 'function') {
                errorCallback(jqXHR, textStatus, errorThrown);
            } else {
                var res = jqXHR.responseJSON;

                if (res && res.returnUrl) {
                    util._tempAjaxReturnUrl = res.returnUrl;
                }
            }
        }).always(function() {
            if (typeof completeCallback == 'function') {
                completeCallback();
                return;
            }

        });
    };

    util.get = function(url, options, successCallback, errorCallback, completeCallback) {
        options = options || {};
        options.method = 'GET';
        util.ajax(url, options, successCallback, errorCallback, completeCallback);
    };

    util.post = function(url, options, successCallback, errorCallback, completeCallback) {
        options = options || {};
        options.method = 'POST';
        util.ajax(url, options, successCallback, errorCallback, completeCallback);
    };

    util.getJSON = function(url, options, successCallback, errorCallback, completeCallback) {
        options = options || {};
        // options.dataType = 'json';
        options.contentType = 'application/json; charset=UTF-8';
        if (!options.data)
            options.data = {};
        options.data = JSON.stringify(options.data);
        util.ajax(url, options, successCallback, errorCallback, completeCallback);
    };

    util.postJSON = function(url, options, successCallback, errorCallback, completeCallback) {
        options = options || {};
        options.method = 'POST';
        // options.dataType = 'json';
        options.contentType = 'application/json; charset=UTF-8';
        if (!options.data)
            options.data = {};
        options.data = JSON.stringify(options.data);
        util.ajax(url, options, successCallback, errorCallback, completeCallback);
    };

    util.postFormData = function(url, options, successCallback, errorCallback) {
        options = options || {};
        options.method = 'POST';
        options.processData = false;
        options.contentType = false;
        util.ajax(url, options, successCallback, errorCallback);
    };

    util.Pagination = {
        rowsPerPage: 10,
        appendRowsPerPage: function(selector) {

        },
        infiniteScroll: function(search, callback, frameEl, contentsEl) {
            var $el = frameEl ? $(frameEl) : $(window);
            var $el2 = contentsEl ? $(contentsEl) : $(document);
            var eventName = 'scroll.infiniteScroll';
            var scrollHandler = function() {
                if (search.page == 1) {
                    search._isListEnd = false;
                }
                if (search.page * search.rowsPerPage >= search.totalRows) {
                    search._isListEnd = true;
                }
                if (search._isAjaxBusy || search._isListEnd || search._isHide) {
                    return;
                }

                var a = $el.scrollTop();
                var b = $el2.height();
                var c = $el.height();
                //				var a = $(window).scrollTop();
                //				var b = $(document).height();
                //				var c = $(window).height();
                // var d = $('.boardList').offset().top
                // var e = $('.boardList').height();
                // var f = b - (d + e);

                //console.log(a, b, c);
                //console.log(a, b - c - search._bottomHeight);

                // if (a >= (d + e) - (c - 75)) {
                if (a >= b - c - (search._bottomHeight || search.bottomHeight || 0)) {
                    search._isAjaxBusy = true;
                    callback(search.page + 1);
                }
            };

            $el.on(eventName, scrollHandler);
        },
        infiniteScrollCallback: function(search) {
            search._isAjaxBusy = false;
            if (search.page * search.rowsPerPage >= search.totalRows) {
                search._isListEnd = true;
            }
        },
        destroyInfiniteScroll: function(frameEl) {
            var $el = frameEl ? $(frameEl) : $(window);
            var eventName = 'scroll.infiniteScroll';
            $el.off(eventName);
        }
    };

    // 스크롤 위치 저장
    util.saveHistoryScrollTop = function() {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        $(window).on('scroll.historyScrollTop', function() {
            history.replaceState({ scrollTop: $(document).scrollTop() }, null, null);
        });
    };
    // 이전 스크롤 위치 복원
    util.restoreHistoryScrollTop = function() {
        if (history.state && history.state.scrollTop) {
            $(document).scrollTop(history.state.scrollTop);
        }
    };

    window.Util = util;

})();

//Vue.js
(function() {

    /************
     * Vue 필터 *
     ************/

    Vue.filter('numberFormat', function(n) {
        return Util.format.number(n);
    });
    Vue.filter('dateFormat', function(date) {
        if (!date)
            return ''
        return moment(date).format('YYYY.MM.DD');
    });
    Vue.filter('datetimeFormat', function(date) {
        if (!date)
            return ''
        return moment(date).format('YYYY.MM.DD HH:mm:ss');
    });
    Vue.filter('unescape', function(s) {
        return Util.format.unescape(s);
    });
    Vue.filter('ellipsis', function(s, n) {
        return Util.format.ellipsis(s, n);
    });
    Vue.filter('dateFormat2', function(date) {
        if (!date)
            return ''
        return moment(date).format('YYYY-MM-DD');
    });
    Vue.filter('maskName', function(txt) {
        if (!txt) {
            return '';
        }
        if (txt.length < 2) {
            return txt;
        } else if (txt.length < 3) {
            return txt.substring(0, 1) + "*";
        }
        var result = txt.substring(0, 1);
        for (var i = 0; i < txt.length - 2; i++) {
            result += "*";
        }
        return result + txt.substring(txt.length - 1, txt.length);
    });
    Vue.filter('maskName2', function(txt) {
        if (!txt) {
            return '';
        }

        var nameArr = txt.split("|");
        var name = nameArr[0];
        var psersonCnt = nameArr[1] ? nameArr[1] : "";

        if (name.length < 2) {
            return name + psersonCnt;
        } else if (name.length < 3) {
            return name.substring(0, 1) + "*" + psersonCnt;
        }
        var result = name.substring(0, 1);
        for (var i = 0; i < name.length - 2; i++) {
            result += "*";
        }
        return result + name.substring(name.length - 1, name.length) + psersonCnt;
    });
    Vue.filter('maskPhone', function(txt) {
        if (!txt) {
            return '';
        }
        if (txt.length < 12) {
            return txt;
        }
        var temp = txt.split("-");
        var arr = [];
        if (temp.length > 0) {
            var a = "";
            for (var i = 0; i < temp[1].length; i++) {
                a += "*";
            }
            temp[1] = a;
            arr = temp;
        } else if (txt.length < 10) {
            arr.push(txt.substring(0, 3));
            var a = "";
            for (var i = 0; i < txt.length - 7; i++) {
                a += "*";
            }
            arr.push(a);
            arr.push(txt.substring(txt.length - 4, txt.length));
        }
        return arr.join("-");
    });
    Vue.filter('maskAddr', function(txt) {
        if (!txt) {
            return '';
        }
        var arr = [];
        var temp = txt.split(" ");
        for (var i in temp) {
            var t = temp[i];
            var tt = "";
            for (var k = 0; k < t.length; k++) {
                tt += "*";
            }
            arr.push(tt);
        }
        return arr.join(" ");
    });
    Vue.filter('maskAccountNo', function(txt) {
        if (!txt) {
            return '';
        }
        return "******" + txt.substring(6, txt.length);
    });

    /****************
     * Vue 디렉티브 *
     ****************/

    // 바인딩 된 엘리먼트가 DOM에 삽입되었을 때 focus. 예: <input v-focus>
    Vue.directive('focus', {
        inserted: function(el) {
            el.focus();
        }
    });
    // 입력 형식 제한. 예: <input v-format.number>
    Vue.directive('format', function(el, binding, vnode) {
        if (binding.modifiers['number']) {
            var s = el.value.toString().replace(/[^0-9]/g, '');
            if (s == '' || isNaN(s)) {
                el.value = '0';
                return;
            }
            var n = Number(s).toString();
            el.value = n.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + ',');
        } else if (binding.modifiers['digit']) {
            el.value = el.value.replace(/[^0-9]/g, '');
        }
    });
    // 이미지 lazy loading
    Vue.directive("lazyload", {
        inserted: el => {
            function loadImage() {
                const isImg = el.nodeName === "IMG";
                // 이미지 태그일 경우만 url 입력 로딩
                if (isImg) {
                    el.src = el.dataset.url;
                }
            }
            function unLoadImage() {
                const isImg = el.nodeName === "IMG";
                // 이미지 태그일 경우만 url 입력 로딩
                if (isImg) {
                    el.src = "";
                }
            }

            function createObserver() {

                const observer = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) { // 감지대상이 교차영역에 진입 할 경우
                            loadImage(); // 교차영역 들어올경우 이미지 로딩
                            //observer.unobserve(el); // 이미지 로딩 이후론 관찰할 필요 x
                        } else {
                            unLoadImage();
                        }
                    });
                });

                observer.observe(el);
            }

            // 지원하지 않는 브라우저는 바로 이미지 로딩을 시켜주도록 호환성 체크
            window["IntersectionObserver"] ? createObserver() : loadImage();
        }
    });

    /****************
     * Vue 컴포넌트 *
     ****************/

    // 숫자 형식 입력
    Vue.component('input-number', {
        template: '\
			<input type="text" ref="input" v-bind:value="value | numberFormat" v-on:input="updateValue($event.target.value)" v-on:focus="selectAll" v-on:blur="formatValue" autocomplete="off">\
		',
        props: {
            value: {
                type: Number,
                default: 0
            }
        },
        methods: {
            updateValue: function(value) {
                var n = value.replace(/[^0-9]/g, '');
                if (n != value || n != this.value) {
                    this.$refs.input.value = n;
                }
                this.$emit('input', Number(n))
            },
            formatValue: function() {
                // this.$refs.input.value = Util.format.number(this.value);
                // this.$refs.input.value = this.value;
            },
            selectAll: function(event) {
                // Workaround for Safari bug
                // http://stackoverflow.com/questions/1269722/selecting-text-on-focus-using-jquery-not-working-in-safari-and-chrome
                var t = event.target;
                setTimeout(function() {
                    t.select()
                }, 0)
            }
        }
    });

    // 숫자 형식 입력
    Vue.component('input-digit', {
        template: '\
			<input type="text" ref="input" v-bind:value="value" v-on:input="updateValue($event.target.value)" v-on:focus="selectAll" v-on:blur="formatValue" autocomplete="off">\
		',
        props: {
            value: {
                type: String,
                default: ''
            }
        },
        methods: {
            updateValue: function(value) {
                // console.log(value, this.value);
                var n = value.replace(/[^0-9]/g, '');
                if (n != value || n != this.value) {
                    this.$refs.input.value = n;
                }
                this.$emit('input', n)
            },
            formatValue: function() {
            },
            selectAll: function(event) {
                // Workaround for Safari bug
                // http://stackoverflow.com/questions/1269722/selecting-text-on-focus-using-jquery-not-working-in-safari-and-chrome
                var t = event.target;
                setTimeout(function() {
                    t.select()
                }, 0)
            }
        }
    });

    // select 템플릿
    Vue.component('select-span', {
        props: {
            value: {
            },
            options: {
                type: Array,
                required: false,
                default: [{ text: '-- 선택 -- ', value: '' }]
            },
            disabled: {
                type: Boolean,
                required: false,
                default: false
            }
        },
        data: function() {
            return {
                isFocus: false
            }
        },
        template: '\
				<span class="select no-jquery" :class="{ disabled : disabled }">\
					<span class="text">{{ text }}</span>\
					<select :value="value" :disabled="disabled" @change="updateValue($event)" autocomplete="off">\
						<option :value="o.value" v-for="(o, i) in options">{{ o.text }}</option>\
					</select>\
				</span>\
			',
        created: function() {
        },
        mounted: function() {
            var t = this;
            if (t.value == null || t.value == '') {
                var op = t.options[0];
                t.$emit('input', op.value);
            }
        },
        methods: {
            updateValue: function(e) {
                // this.text = e.target.options[e.target.options.selectedIndex].text;
                this.$emit('change', e);
                this.$emit('input', e.target.value);
            }
        },
        computed: {
            text: function() {
                var t = this, i = 0;
                if (t.options && t.options.length) {
                    t.options.some(function(o, j) {
                        if (t.value == o.value) {
                            i = j;
                            return true;
                        }
                    });
                    return t.options[i].text;
                } else {
                    return '';
                }
            }
        }
    });

    // 페이징
    Vue.component('pagination', {
        template: '\
			<div class="paging">\
				<button type="button" class="button button_prev" :class="{disable : isInFirstPage}" @click="onClickPreviousPage">\
					<span class="blind">이전</span>\
				</button>\
				<span class="num">\
					<a href="#none" :class="{ on: isPageActive(page.no) }" @click.prevent="onClickPage(page.no)" v-for="page in pages">\
						<strong v-if="isPageActive(page.no)">{{ page.no }}</strong>\
						<template v-else>{{ page.no }}</template>\
					</a>\
				</span>\
				<button type="button" class="button button_next" :class="{disable : isInLastPage}" @click="onClickNextPage">\
					<span class="blind">다음</span>\
				</button>\
			</div>\
		',
        props: {
            pageButtons: {
                type: Number,
                required: false,
                'default': 10
            },
            rowsPerPage: {
                type: Number,
                required: true,
                'default': 10
            },
            currentPage: {
                type: Number,
                required: true,
                'default': 1
            },
            totalRows: {
                type: Number,
                required: true,
                'default': 0
            }
        },
        computed: {
            totalPages: function() {
                return Math.ceil(this.totalRows / this.rowsPerPage) || 1;
            },
            startPage: function() {
                return Math.floor((this.currentPage - 1) / this.pageButtons) * this.pageButtons + 1;
            },
            endPage: function() {
                return Math.min(this.startPage + this.pageButtons - 1, this.totalPages);
            },
            pages: function() {
                var range = [];
                for (var i = this.startPage; i <= this.endPage; i += 1) {
                    range.push({
                        no: i,
                        isDisabled: i === this.currentPage
                    });
                }
                return range;
            },
            isInFirstPage: function() {
                return this.currentPage === 1;
            },
            isInLastPage: function() {
                return this.currentPage === this.totalPages;
            }
        },
        methods: {
            onClickFirstPage: function() {
                if (this.isInFirstPage) {
                    return;
                }
                this.$emit('pagechanged', 1);
            },
            onClickPreviousPage: function() {
                if (this.isInFirstPage) {
                    return;
                }
                this.$emit('pagechanged', this.currentPage - 1);
            },
            onClickPage: function(page) {
                if (this.currentPage === page) {
                    return;
                }
                this.$emit('pagechanged', page);
            },
            onClickNextPage: function() {
                if (this.isInLastPage) {
                    return;
                }
                this.$emit('pagechanged', this.currentPage + 1);
            },
            onClickLastPage: function() {
                if (this.isInLastPage) {
                    return;
                }
                this.$emit('pagechanged', this.totalPages);
            },
            isPageActive: function(page) {
                return this.currentPage === page;
            }
        }
    });


})();

$(document).ready(function() {

});
