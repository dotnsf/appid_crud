//. get_profiles.js
var request = require( 'request' );
var settings = require( './settings' );

var tenantId = settings.tenantId;
var region = settings.region;
var userId = settings.userId;
if( process.argv.length > 2 ){
  userId = process.argv[2];
}
console.log( 'userId = ' + userId );

if( userId ){
  getProfile();
}else{
  console.log( 'Usage: $ node get_profile <userId>' );
}

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
