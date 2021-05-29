mergeInto(LibraryManager.library, {
    on_success: function (results) {
        return onSuccess(UTF8ToString(results));
    },
    on_error: function (results) {
        return onError(UTF8ToString(results));
    },
});
