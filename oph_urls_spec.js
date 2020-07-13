var assert = require('assert');
var nock = require('nock');
global.XMLHttpRequest = require('xhr2');

describe('oph_urls.js', function() {
    var ctx = require("./oph_urls.js")
    beforeEach(function() {
        ctx.urls.scopes = {}
        ctx.urls() // re-initialize
    });

    it('resolve url and throw error on unknown', function () {
        ctx.urls.addProperties({
            "a.b": "1"
        })

        assert.equal(ctx.url("a.b"), "1");

        assert.throws(function() {
            ctx.url("b.b")
        }, function(err){
            assert.equal(err.message, "Could not resolve value for 'b.b'")
            return true;
        })
    });

    it('handle baseUrl', function () {
        ctx.urls.addProperties ( {
            "a.a": "1",
            "b.b": "2",
            "c.c": "3",
            "d.d": "4",
            "a.baseUrl": "http://pow",
            "d.baseUrl": "/",
            "baseUrl": "http://bar"
        })

        assert.equal(ctx.url("a.a"), "http://pow/1");
        assert.equal(ctx.url("b.b"), "http://bar/2");
        assert.equal(ctx.url("d.d"), "/4");

        // ctx.urls.override overrides baseUrl
        ctx.urls.addOverrides( {
            "baseUrl": "http://foo"
        })
        assert.equal(ctx.url("a.a"), "http://pow/1");
        assert.equal(ctx.url("b.b"), "http://foo/2");
    });

    it('parameter replace', function () {
        ctx.urls.addProperties({
            "a.a": "/a/$1",
            "b.b": "/b/$param"
        })

        assert.equal(ctx.url("a.a"), "/a/$1");
        assert.equal(ctx.url("a.a",1), "/a/1");
        assert.equal(ctx.url("b.b"), "/b/$param");
        assert.equal(ctx.url("b.b", {
            param: "pow"
        }), "/b/pow");
        // extra named parameters go to queryString
        assert.equal(ctx.url("b.b", {
            param: "pow",
            queryParameter: "123",
            queryParameter2: "123"
        }), "/b/pow?queryParameter=123&queryParameter2=123");
        // extra named parameters go to queryString
        assert.equal(ctx.url("b.b", {
            queryParameter: ["123","1234"]
        }), "/b/$param?queryParameter=123&queryParameter=1234");
    });

    it('parameter encode', function () {
        ctx.urls.addProperties({
            "a.a": "/a/$1",
            "b.b": "/b/$param"
        })
        assert.equal(ctx.url("a.a","1:"), "/a/1%3A");
        assert.equal(ctx.url("b.b", {
            param: "pow:"
        }), "/b/pow%3A");
        assert.equal(ctx.url("b.b", {
            param: "pow",
            "query Parameter": "1:23",
            "query Parameter2": "1:23"
        }), "/b/pow?query%20Parameter=1%3A23&query%20Parameter2=1%3A23");
        var ctx2 = ctx.urls().noEncode()
        assert.equal(ctx.url("a.a","1:"), "/a/1%3A");
        assert.equal(ctx2.url("a.a","1:"), "/a/1:");
        assert.equal(ctx2.url("b.b", {
            param: "pow:"
        }), "/b/pow:");
        assert.equal(ctx2.url("b.b", {
            param: "pow",
            "query Parameter": "1:23",
            "query Parameter2": "1:23"
        }), "/b/pow?query Parameter=1:23&query Parameter2=1:23");
        assert.equal(ctx2.url("b.b", {
            param: "pow",
            "query Parameter": ["1:23",2]
        }), "/b/pow?query Parameter=1:23&query Parameter=2");
    });

    it('parameter and url lookup order', function() {
        ctx.urls.addDefaults({"a.a": "b"})
        assert.equal(ctx.url("a.a"), "b");

        ctx.urls.addProperties({"a.a": "c"})
        assert.equal(ctx.url("a.a"), "c");

        ctx.urls.addOverrides({"a.a":"d"})
        assert.equal(ctx.url("a.a"), "d");
    })

    it("should omit empty values", function() {
        ctx.urls.addDefaults({"a.a": "b"})
        assert.equal(ctx.url("a.a"), "b");
        assert.equal(ctx.url("a.a",{}), "b");
        assert.equal(ctx.url("a.a",{a: "", b: null, c:undefined, d:1}), "b?a=&d=1");
        assert.equal(ctx.urls().omitEmptyValuesFromQuerystring().url("a.a",{a: "", b: null, c:undefined, d:1}), "b?d=1");
    })

    it("should support url scopes", function() {
        ctx.urls.addDefaults({"a.a": "b"})
        ctx.urls().addProperties({"a.c": "d"})
        ctx.urls("test").addDefaults({"a.a": "e"})
        ctx.urls("test").addOverrides({"a.b": "f"})
        assert.equal(ctx.url("a.a"), "b");
        assert.equal(ctx.url("a.c"), "d");
        assert.equal(ctx.urls("test").url("a.a"), "e");
        assert.equal(ctx.urls("test").url("a.b"), "f");
    })

    it("should set caller id, if provided", async function() {
        var url = "http://foo.bar"
        var callerId = 'Midnight Caller'
        ctx.urls.addCallerId(callerId)
        var scope = nock(url, {
            reqheaders: { 'Caller-Id': callerId }
        }).get('/').reply(200, { 'some': 'data' })
        await ctx.urls.load(url)
        scope.done()
    })
});
