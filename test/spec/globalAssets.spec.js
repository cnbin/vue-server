var cheerio = require('cheerio');
var VueServer = require('../../index.js');
var VueRender = VueServer.renderer;
var $;

beforeAll(function (done) {
    var Vue = new VueRender();

    Vue.config.silent = true;
    Vue.config.replace = false;

    var Comp = Vue.component('comp', {
        template: '<i>present</i>'
    });

    var Filtr = Vue.filter('filtr', function (value) {
        return value + ' filtered';
    });

    var Part = Vue.partial('part', '<i>partial content</i>');

    Vue.mixin = [{
        data: function () {
            return {
                globalMixinValue: 'global mixin data value'
            };
        }
    }];

    Vue.prototype.$myMethod = function () {
        return '$myMethod returns value';
    };

    var vm = new Vue({
        template: [
            '<div id="component" is="comp"></div>',
            '<div id="component2" is="comp2"></div>',
            '<div id="filter">{{value | filtr}}</div>',
            '<div id="filter2">{{value | filtr2}}</div>',
            '<div id="partial"><partial name="part"></partial></div>',
            '<div id="partial2"><partial name="part2"></partial></div>',
            '<div id="mixin">{{globalMixinValue}}</div>',
            '<div id="prototype">{{globalPrototypeValue}}</div>',
            '<div id="extended-component"><extended></extended></div>',
        ].join(''),
        data: {
            value: 'value'
        },

        components: {
            extended: Vue.extend({
                replace: true,
                template: '<i>Yes it is</i>'
            }),
            comp2: Comp
        },

        partials: {
            part2: Part
        },

        filters: {
            filtr2: Filtr
        },

        compiledBe: function () {
            this.globalPrototypeValue = this.$myMethod();
        }
    });

    vm.$on('vueServer.htmlReady', function (html) {
        $ = cheerio.load(html);
        done();
    });
});

describe('global', function () {
    it('component registration should work', function () {
        expect($('#component').html()).toEqual('<i>present</i>');
    });

    it('component function should return the component', function () {
        expect($('#component2').html()).toEqual('<i>present</i>');
    });

    it('filter registration should work', function () {
        expect($('#filter').html()).toEqual('value filtered');
    });

    it('filter function should return the filter', function () {
        expect($('#filter2').html()).toEqual('value filtered');
    });

    it('partial registration should work', function () {
        expect($('#partial').html()).toEqual('<i>partial content</i>');
    });

    it('partial function should return the partial', function () {
        expect($('#partial2').html()).toEqual('<i>partial content</i>');
    });

    it('mixin should work', function () {
        expect($('#mixin').html()).toEqual('global mixin data value');
    });

    it('prototype extends instances', function () {
        expect($('#prototype').html()).toEqual('$myMethod returns value');
    });

    it('component mounting through Vue.extend works', function () {
        expect($('#extended-component').html()).toEqual('<i>Yes it is</i>');
    });
});
