/**
 * Created by sdawood on 12/06/2015.

 REACTAZ (Resource Active Tags) or just call me "raz"
 ^
 10   Meet Reac Taz
 9
 8        ^   ^
 7       (@) (#)
 6          $
 5      <=-...+=>
 4
 3         ><
 2        DATA
 1        TAZ
 0 1 2 3 4 5 6 7 8 9 10 $*/


module.exports = [
  {
    "expression": {
      "type": "identifier",
      "value": "expression"
    },
    "operation": "member",
    "scope": "child"
  },
  {
    "expression": {
      "type": "identifier",
      "value": "active"
    },
    "operation": "member",
    "scope": "child"
  },
  {
    "expression": {
      "type": "union",
      "value": [
        {
          "branch": {
            "path": [
              {
                "expression": {
                  "type": "union",
                  "value": [
                    {
                      "expression": {
                        "type": "identifier",
                        "value": "provider"
                      }
                    },
                    {
                      "expression": {
                        "type": "identifier",
                        "value": "script"
                      }
                    },
                    {
                      "expression": {
                        "type": "identifier",
                        "value": "value"
                      }
                    }
                  ]
                },
                "operation": "subscript",
                "scope": "child|branch"
              }
            ],
            "scope": "branch"
          },
          "expression": {
            "type": "identifier",
            "value": "map"
          }
        },
        {
          "branch": {
            "path": [
              {
                "expression": {
                  "active": {
                    "filter": {
                      "script": "{@=={}}",
                      "value": "?{@=={}}"
                    },
                    "stream": {},
                    "value": "?{@=={}}"
                  },
                  "type": "filter_expression|active",
                  "value": "({@=={}})"
                },
                "operation": "member",
                "scope": "child|branch"
              }
            ],
            "scope": "branch"
          },
          "expression": {
            "type": "identifier",
            "value": "reduce"
          }
        }
      ]
    },
    "operation": "subscript",
    "scope": "child"
  }
]