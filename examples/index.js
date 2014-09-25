var eventStream = require( 'event-stream' ),
	flowFactory = require( './../lib' );

// Create some data...
// var data = [1,5,3,6,8,7,-8,2,0,1,56,8,9,5,8];
var data = new Array( 100 );
for ( var i = 0; i < data.length; i++ ) {
	data[ i ] = Math.round( Math.random() * 100 ) - 5;
}


// Create a readable stream:
var readStream = eventStream.readArray( data );

// Create a new stream:
var stream = flowFactory().stream();

// Pipe the data:
readStream
	.pipe( stream )
	.pipe( eventStream.map( function( d, clbk ){
		clbk( null, d.toString()+'\n' );
	}))
	.pipe( process.stdout );