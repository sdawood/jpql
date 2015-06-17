/**
 * Created by sdawood on 14/06/2015.
 *
 * React@$ (Resource Active Tags) or just call me "^raz"
 ^                       ITGO
 *                       HOME
 10               $.R.e.a.c.[T].a.z.*
 9                      ^  ^
 8                     (@)(#)
 7
 6                       $
 5                "<=""-::+""=>"
 4
 3                      ><
 2                     DATA
 1                     TAZ
 0   1   2   3   4   5   6   7   8   9   10  $   @*/

module.expoorts = {
  provider: '[$escape, $escapeAll, $quoteAll]',
  tagscripts: {
    $escape: function (string) {

      return (String(string)).replace(/["'\\\n\r\u2028\u2029]/g, function (character) {
        // Escape all characters not included in SingleStringCharacters and
        // DoubleStringCharacters on
        // http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
        switch (character) {
          case '"':
          case "'":
          case '\\':
            return '\\' + character
          // Four possible LineTerminator characters need to be escaped:
          case '\n':
            return '\\n'
          case '\r':
            return '\\r'
          case '\u2028':
            return '\\u2028'
          case '\u2029':
            return '\\u2029'
        }
      })
    },

    $escapeAll: function () {
      var hunks = Array.prototype.slice.call(arguments);
      return hunks.map(function (value) {
        return $escape(value);
      }).join(",");
    },

    $quoteAll: function (hunks) {
      hunks = (hunks instanceof Array ? hunks : [hunks]).concat(Array.prototype.slice.call(arguments, 1));
      return hunks.map(function (value) {
        return '"' + value + '"';
      }).join(",");
    }
  }
}