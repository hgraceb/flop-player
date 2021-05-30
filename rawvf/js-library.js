mergeInto(LibraryManager.library, {
    onprogress: function (result) {
        return onprogress(UTF8ToString(result));
    },
    onsuccess: function () {
        return onsuccess();
    },
    onerror: function (errCode, errMsg) {
        return onerror(errCode, UTF8ToString(errMsg));
    },
});
