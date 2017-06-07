service.register('middleware', {
  'cookie'        : require('./cookie'),
  'language'      : require('./language'),
  'authentication': require('./authentication')
});
