define([ 'notify', 'notify-sl', 'translate' ], function ( ndesktop, nmobile, t ) {
  return function ( title, options ) {
    if ( !options ) {
      options = title;
      title   = t(options.title || '');
    }
    title = t(title);
    if ( !options.body ) {
      throw "Missing body";
    } else {
      options.body = t(options.body);
    }

    try {
      ndesktop(title, options);
    } catch ( e ) {
      options.timeout = options.timeout || 3000;
      //options.buttons = { 'label-ok': true };
      nmobile.alert(options.body, title, options);
    }
  }
});
