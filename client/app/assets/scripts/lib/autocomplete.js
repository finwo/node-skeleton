define([  ], function (  ) {

  //// Our processor
  //function process() {
  //  $("[data-autocomplete]").each(function () {
  //    var $this = $(this),
  //        key   = $this.attr('data-autocomplete');
  //    $this.removeAttr('data-autocomplete');
  //    $this.autoComplete({
  //      minChars: $this.attr('data-min-chars') || 1,
  //      source  : function ( term, suggest ) {
  //        var options       = { path: key };
  //        options.apiParams = { q: term };
  //        bind(options)
  //          .then(function ( result ) {
  //            return result.map(function ( user ) {
  //              return user.username;
  //            })
  //          })
  //          .then(suggest);
  //      }
  //    });
  //  });
  //}
  //
  //// Listen for new elements
  //$(document.body).watch({
  //  properties: "prop_innerHTML",
  //  callback  : process
  //});
  //
  //// Make an initial call
  //process();

  return true;
});

