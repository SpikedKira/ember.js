import { assert } from 'ember-debug';

/**
@module ember
@submodule ember-metal
*/

var END_WITH_EACH_REGEX = /\.@each$/,
    NESTED_BRACES = /\{[^}{]*\{|\}[^}{]*\}/g;

/**
  Expands `pattern`, invoking `callback` for each expansion.

  The only pattern supported is brace-expansion, anything else will be passed
  once to `callback` directly.

  Example

  ```js
  function echo(arg){ console.log(arg); }

  Ember.expandProperties('foo.bar', echo);              //=> 'foo.bar'
  Ember.expandProperties('{foo,bar}', echo);            //=> 'foo', 'bar'
  Ember.expandProperties('foo.{bar,baz}', echo);        //=> 'foo.bar', 'foo.baz'
  Ember.expandProperties('{foo,bar}.baz', echo);        //=> 'foo.baz', 'bar.baz'
  Ember.expandProperties('foo.{bar,baz}.[]', echo)      //=> 'foo.bar.[]', 'foo.baz.[]'
  Ember.expandProperties('{foo,bar}.{spam,eggs}', echo) //=> 'foo.spam', 'foo.eggs', 'bar.spam', 'bar.eggs'
  Ember.expandProperties('{foo}.bar.{baz}')             //=> 'foo.bar.baz'
  ```

  @method expandProperties
  @for Ember
  @private
  @param {String} pattern The property pattern to expand.
  @param {Function} callback The callback to invoke.  It is invoked once per
  expansion, and is passed the expansion.
*/
export default function expandProperties(pattern, callback) {
  assert('A computed property key must be a string', typeof pattern === 'string');
  assert(
    'Brace expanded properties cannot contain spaces, e.g. "user.{firstName, lastName}" should be "user.{firstName,lastName}"',
    pattern.indexOf(' ') === -1
  );
  assert(
    `Brace expanded properties have to be balanced and cannot be nested, pattern: ${pattern}`,
    pattern.match( NESTED_BRACES ) === null
  );

  if (pattern.indexOf('{') < 0) {
    callback( pattern.replace(END_WITH_EACH_REGEX, '.[]') );
  } else {
    dive("", pattern, callback);
  }
}

function dive(prefix, pattern, callback) {
  var start = pattern.indexOf('{');

  if (start < 0) {
    callback((prefix + pattern).replace(END_WITH_EACH_REGEX, '.[]'));
    return;
  }

  var end = pattern.indexOf('}');
  var tempArr = pattern.substring(start + 1, end).split(',');
  var after = pattern.substring(end + 1);
  prefix = prefix + pattern.substring(0, start);

  let i = tempArr.length;
  let k = 0;
  while (k < i) {
    dive(prefix + tempArr[k++], after, callback);
  }
}
