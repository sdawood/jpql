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


/*
* Reactshell is a live data coding IDE
*
* Starting with an empty shell, with a gallery of available builtin tags, and a couple of bookmarked source tags
*
* You start to interactively query on of the available sources, for a list of available nodes
*
* When you have an idea about the API endpoint you would want to interact with, you require paths of the nodes that each API can provide
*
* Then you starting blueprinting your datatag template, for example
*
* postLocationToSocial = $.api{
*   social {
*     facebook[login, post],
*     twitter[login, post]
*   },
*   geo {
*     mobile.lastChekin.*
*     }
*   }
*
* now you can use this blueprint walk the actual source, and query every end poit about the parameters and JSON-LD actions it requires POST, PUT, or provides GET
*
* Your shell receives back an aggregated graph of nodes, laid out in space according to the structure declared in the path.
*
* The object you just received is the Subject that either holds the mapping to all children subjects and forward subscription requests to the node@path
* or bu default, aggregate all updates through one active pipe, with every message received is stamped with its source and tags, and send down the stream.
*
* Your custom business logic code would interact with the Subject, selectively subscribing to individual source if desired, or chose to apply a series
* of more specialized selects to retrieve subset of values by applying map, filter, delay, debounce, etc. All standard Observable goodness and ES6 Promises is available here.
*
* A more typical use case for the front end TagWidgets or any React application, web or mobile is for the app to use React templates
* That bind to individual nodes using the tags, e.g. {{#online}} would subscribe to updates from the #online tag, that could have the path
*
* $.api.social.facebook.status(#credentials #login=>{$args.username, $args.password}):(=>{this.isOnline})
*
* the #online tag
*
* queries from root down to the facebook status REST endpoint,
* requires #credentials, which is just data, not an active script, content of #credentials are available as $args.key1 for credential.key1
*
* the script then requires login, not the order of requiring matters, the provider script invokes login providing username and password
*
* login can be a complex tag predefined in the facebook package
*
* the execution then proceeds to the reduce script, that returns the isOnline flag, an alternative syntax is @.isOnline
*
* the path performs 4 local navigation through your local package tagmodules
*
* retrieved data from secure config store #credentials
*
* passed the data a long to a module #login that is required when needed
*
* invoked login and piped the result into another piece of code, that is pretty selective about which fields it want to display
*
* and returns true or false
*
* A simple widge with a single indicator that changes color to red for offline and green for online can be declared
* templated and packaged up
*
* All endpoints and filed requirements are secified in the path
* this is the "requires" specification for your tag
*
* Also the interpreter had recorded that your code produced a single value at a leaf path node
* This is the "provides" specification for the tag
*
* You can host this tag as a lamba service in the cloud, continuously broadcasting a single literal, wheather you are online on facebook
* or not, you can now make this information public or grant access to the TAZ to your girlfriend, so that she would jump online for a chat
*
* She can receive notification from her AppleWatch, or any wearable, or through web/mobile legacy channels, even an email.
*
* Now we have pretty much gone all the way from declarative data devops, to graph query to automated REST apis to
* microservice blueprint realization
*
* RESTful express module with path routers can be generated, similar to apigee a127, they can link back to datataz hosted tag cloud services if the user has an account
*
* also doubled as an npm for Data, you can tell everyone what your provide or require and you'd be matched up
* with other users, developes and even collectors of novelty Tazs, where you can exchange ideas or trade Taz for Coins
*
*
* All the above is available as a library for working with micro data tags services
* or just to write an effective water tight test suite for your node.js client app conusming data from Neo4j or
* doing intensive juggling between JSON Documents flooding down a MongoDB and Co source
*
* */