//. app.js
//. https://us-south.appid.cloud.ibm.com/swagger-ui/#/
var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    fs = require( 'fs' ),
    ejs = require( 'ejs' ),
    request = require( 'request' ),
    app = express();
var settings = require( './settings' );

var tenantId = settings.tenantId;
var region = settings.region;
//var userId = settings.userId;
var access_token = null;

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( express.Router() );
app.use( express.static( __dirname + '/public' ) );

app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'ejs' );

app.get( '/', function( req, res ){
  res.render( 'index', {} );
});

app.get( '/users', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var users = await getUsers();
  res.write( JSON.stringify( { status: true, users: users } ) );
  res.end();
});

app.post( '/user', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
});

app.get( '/user/:id', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var id = req.params.id;
  var user = await getUser( id );
  res.write( JSON.stringify( { status: true, user: user } ) );
  res.end();
});

app.put( '/user/:id', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var id = req.params.id;
  var user = req.body; //. { attributes: { aa: 'xx', bb: 'yy', .. } }
  var result = await updateUser( id, user );
  res.write( JSON.stringify( { status: true, result: result } ) );
  res.end();
});

app.delete( '/user/:id', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var id = req.params.id;
  var result = await deleteUser( id );
  res.write( JSON.stringify( { status: true, result: result } ) );
  res.end();
});

getAccessToken();
async function getAccessToken(){
  return new Promise( async ( resolve, reject ) => {
    access_token = await settings.getAccessToken();
    resolve( access_token );
  });
}

async function getUsers(){
  return new Promise( async ( resolve, reject ) => {
    if( access_token ){
      var headers1 = {
        accept: 'application/json',
        authorization: 'Bearer ' + access_token
      };
      var option1 = {
        url: 'https://' + region + '.appid.cloud.ibm.com/management/v4/' + tenantId + '/users?dataScope=full',
        method: 'GET',
        headers: headers1
      };
      request( option1, ( err1, res1, body1 ) => {
        if( err1 ){
          console.log( 'err1', err1 );
          reject( err1 );
        }else{
          var profile = JSON.parse( body1 );
          resolve( profile.users );
        }
      });
    }else{
      reject( null );
    }
  });
}

async function getUser( id ){
  return new Promise( async ( resolve, reject ) => {
    if( access_token && id ){
      var headers1 = {
        accept: 'application/json',
        authorization: 'Bearer ' + access_token
      };
      var option1 = {
        url: 'https://' + region + '.appid.cloud.ibm.com/management/v4/' + tenantId + '/users/' + id + '/profile',
        method: 'GET',
        headers: headers1
      };
      request( option1, ( err1, res1, body1 ) => {
        if( err1 ){
          console.log( 'err1', err1 );
          reject( err1 );
        }else{
          var profile = JSON.parse( body1 );
          resolve( profile );
        }
      });
    }else{
      reject( null );
    }
  });
}

async function updateUser( id, profile ){
  return new Promise( async ( resolve, reject ) => {
    console.log( 'profile', profile );
    if( access_token && id ){
      var headers1 = {
        accept: 'application/json',
        authorization: 'Bearer ' + access_token
      };
      var option1 = {
        url: 'https://' + region + '.appid.cloud.ibm.com/management/v4/' + tenantId + '/users/' + id + '/profile',
        method: 'PUT',
        data: profile,  //. { attributes: { aa: 'xx', bb: 'yy', .. } }
        headers: headers1
      };
      request( option1, ( err1, res1, body1 ) => {
        if( err1 ){
          console.log( 'err1', err1 );
          reject( err1 );
        }else{
          //. body1 = {"errorCode":"INVALID_REQUEST","message":"data should have required property 'attributes'"}
          console.log( 'body1', body1 );
          var result = JSON.parse( body1 );
          resolve( result );
        }
      });
    }else{
      reject( null );
    }
  });
}

async function deleteUser( id ){
  return new Promise( async ( resolve, reject ) => {
    if( access_token && id ){
      var headers1 = {
        accept: 'application/json',
        authorization: 'Bearer ' + access_token
      };
      var option1 = {
        url: 'https://' + region + '.appid.cloud.ibm.com/management/v4/' + tenantId + '/users/' + id,
        method: 'DELETE',
        headers: headers1
      };
      request( option1, ( err1, res1, body1 ) => {
        if( err1 ){
          console.log( 'err1', err1 );
          reject( err1 );
        }else{
          //console.log( res1 );
          console.log( body1 ); //'Forbidden' ??
          var result = JSON.parse( body1 );
          resolve( result );
        }
      });
    }else{
      reject( null );
    }
  });
}

var port = process.env.PORT || 8080;
app.listen( port );
console.log( "server starting on " + port + " ..." );



async function getProfile(){
  return new Promise( async ( resolve, reject ) => {
    var access_token = await settings.getAccessToken();
    if( access_token ){
      //console.log( 'access_token = ' + access_token );
      //. https://cloud.ibm.com/docs/appid?topic=appid-user-admin
      var headers1 = {
        accept: 'application/json',
        authorization: 'Bearer ' + access_token
      };
      var option1 = {
        url: 'https://' + region + '.appid.cloud.ibm.com/management/v4/' + tenantId + '/users/' + userId + '/profile',
        method: 'GET',
        headers: headers1
      };
      request( option1, ( err1, res1, body1 ) => {
        if( err1 ){
          console.log( 'err1', err1 );
          reject( err1 );
        }else{
          var profile = JSON.parse( body1 );
          console.log( JSON.stringify( profile, null, 2 ) );

          var headers2 = {
            accept: 'application/json',
            authorization: 'Bearer ' + access_token
          };
          var option2 = {
            url: 'https://' + region + '.appid.cloud.ibm.com/management/v4/' + tenantId + '/users/' + userId + '/roles',
            method: 'GET',
            headers: headers2
          };
          request( option2, ( err2, res2, body2 ) => {
            if( err2 ){
              console.log( 'err2', err2 );
              reject( err2 );
            }else{
              //. this means no error
              body2 = JSON.parse( body2 );
              var roles = body2.roles;

              //. カスタム属性
              //. https://qiita.com/yo24/items/7b577891d67cec52d9b2

              //console.log( profile, roles );
              console.log( JSON.stringify( profile, null, 2 ) );
              resolve( { status: true, profile: profile, roles: roles } );
            }
          });
        }
      });
    }
  });
}
