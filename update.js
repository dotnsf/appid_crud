//. update.js
var request = require( 'request' );

var apiKey = '';    // <-- EDIT
var tenantId = '';  // <-- EDIT
var region = '';    // <-- EDIT
var userId = '';    // <-- EDIT
var access_token = null;
console.log( 'userId = ' + userId );

if( apiKey && tenantId && region && userId ){
  getAccessToken().then( function( token ){
    access_token = token;

    getUser( userId );                                        //. -> success
    updateUser( userId, { attributes: { company: 'XYX' } } ); //. -> fail ??
  }).catch( function( e ){
    console.log( 'getAccessToken: error', e );
  });
}else{
  console.log( 'no credential information.' );
}


async function getAccessToken(){
  return new Promise( async ( resolve, reject ) => {
    //. GET an IAM token
    //. https://cloud.ibm.com/docs/appid?topic=appid-manging-api&locale=ja
    var headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    };
    var option = {
      url: 'https://iam.cloud.ibm.com/oidc/token',
      method: 'POST',
      body: 'grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=' + apiKey,
      headers: headers
    };
    request( option, ( err, res, body ) => {
      if( err ){
        console.log( err );
        resolve( null );
      }else{
        body = JSON.parse( body );
        var access_token = body.access_token;
        resolve( access_token );
      }
    });
  });
}

//. GET /management/v4/{tenantId}/users/{id}/profile
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
          console.log( 'GET profile fail', err1 );
          reject( err1 );
        }else{
          var profile = JSON.parse( body1 );
	  console.log( 'GET profile success', profile );
          resolve( profile );
        }
      });
    }else{
      reject( null );
    }
  });
}

//. PUT /management/v4/{tenantId}/users/{id}/profile
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
        data: profile,  //. { attributes: { company: 'xyz' } }
        headers: headers1
      };
      request( option1, ( err1, res1, body1 ) => {
        if( err1 ){
          console.log( 'UPGATE profile fail', err1 );
          reject( err1 );
        }else{
          //. body1 = {"errorCode":"INVALID_REQUEST","message":"data should have required property 'attributes'"}
          console.log( 'UPGATE profile sucess', body1 );
          var result = JSON.parse( body1 );
          resolve( result );
        }
      });
    }else{
      reject( null );
    }
  });
}

