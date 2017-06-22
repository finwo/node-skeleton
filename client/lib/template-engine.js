var through    = require('through2'),
    handlebars = require('handlebars'),
    gutil      = require('gulp-util'),
    extend     = require('extend'),
    fs         = require('fs'),
    path       = require('path'),
    glob       = require('globby'),
    reduce     = require('object.reduce'),
    context    = {},
    engine;

engine = module.exports = {
  _context: {},

  _handlebars: handlebars,

  _i18n: null,

  data: function (toAdd) {
    extend(true, this._context, toAdd);

    return this;
  },

  helper: function (name, helper) {
    handlebars.registerHelper(name, helper);
  },

  enableI18n: function (instance) {
    this._i18n = instance;

    function i18n () {
      var args     = object_to_array(arguments),
          options  = args.pop(),
          argument = args.join('-');

      var argumentsForApply = [];

      if (typeof argument === 'object' && argument.hash) {
        argumentsForApply.push(argument.hash);
      } else {
        argumentsForApply.push(argument);
      }

      if (options && typeof options.hash === 'object' && Object.keys(options.hash) > 0) {
        argumentsForApply.push(options.hash);
      } else if (options && options.data && options.data.root) {
        argumentsForApply.push(options.data.root)
      }

      return instance.__.apply(instance, argumentsForApply);
    }

    this.helper('i18n', i18n);

    this.helper('i18n_urlencoded', function(text) {
      return encodeURI(i18n(text));
    })
  },

  partials: function (partials) {
    var partialContents = {},
        parts           = partials.match(/(.*?)\*/),
        base            = parts && parts[1] ? parts[1] : '';

    function makeName (forFile) {
      return forFile
        .replace(new RegExp('^' + base), '')
        .replace(new RegExp(path.extname(forFile) + '$'), '');
    }

    if (typeof partials !== 'string') {
      return;
    }

    reduce(glob.sync(partials), function (acc, fp) {
      acc[makeName(fp.toString())] = fs.readFileSync(path.resolve(fp), {encoding: 'utf8'});

      return acc;
    }, partialContents);

    Object.getOwnPropertyNames(partialContents).forEach(function (name) {
      handlebars.registerPartial(name, partialContents[name]);
    });

    return this;
  },

  compiler: function (contents, options) {
    return handlebars.compile(contents)(extend(true, {}, options, this._context));
  },

  render: function () {
    var self = this;

    return through.obj(function (file, enc, callback) {
      if (file.isNull()) {
        return callback(null, file);
      }

      if (file.isStream()) {
        this.emit('error', new gutil.PluginError('Render', 'Streaming not supported'));
        return callback();
      }

      var pageName = file.path.replace(/\.\w+$/, '').replace(file.base, ''),
          compiled;

      try {
        compiled = self.compiler(file.contents.toString(), {
          __pageName: file.path.replace(/\.\w+$/, '').replace(file.base, '')
        });
      } catch (error) {
        this.emit('error', new gutil.PluginError('Render', error, {fileName: file.path}));

        return callback();
      }

      file.contents = new Buffer(compiled);
      file.path = gutil.replaceExtension(file.path, '.html').replace(pageName, self._i18n.__(pageName));

      callback(null, file);
    });
  }
};

engine.helper('neq', function (a, b, options) {
  if (a !== b) {
    return options.fn(this);
  }
});

engine.helper('eq', function (a, b, options) {
  if (a === b) {
    return options.fn(this);
  }
});

engine.helper('thisYear', function () {
  return new Date().getFullYear();
});
