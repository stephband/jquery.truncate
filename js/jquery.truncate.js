// jquery.truncate.js
// 
// 0.4
// Stephen Band
// 
// Truncates the html of a node so that the node is no greater than one line high
// Options:
// marker					- character or jQuery object plcaed at end of truncation.
// match 					- content to match in height, typically smething like '<br /><br />'.
// truncateByWord - causes truncation only to happen on word boundaries. Faster.
//
// TODO:
// Try using letter-spacing to condense words before truncating them
// Support file extensions by truncating the middle a la OS X: 'xxxxxx...xxx'

(function(undefined){
	
	var options = {
				marker: '&hellip;',
				match: '&nbsp;',
				truncateByWord: false
				//height: false
			},
			// Uses a zero width character for testing
			testNode = jQuery('<span/>').html('&#8204;');
	
	jQuery.fn.truncate = function(text, o){
		if (typeof text !== 'string') {
			o = text;
			text = undefined;
		}
		
		o = jQuery.extend({}, options, o);
		
		return this.each(function(){
			var node = jQuery(this),
					data = node.data('truncate'),
					html = text || data && data.html || node.html(),
					newHtml = html,
					testHeight = o.height,
					length = html.length,
					lineHeight = parseInt( node.css('lineHeight') ),
					targetOffset, normalOffset, currentOffset,
					lineOffset, lines;
			
			if ( !data ) {
				node.data('truncate', {
					html: html
				});
				
				jQuery(window)
				.bind('resize', function(){
					// Iterative, yes, cool, questionable
					node.truncate();
				});
			}
			
			// If it's not visible we can't do anything with it
			if ( !node.is(":visible") ) {
			 return;
			}
			
			// Offset of the node when it's full,
			node
			.html( html )
			.append( testNode );
			currentOffset = testNode.offset();
			
			// and when it has target content in it.
			node
			.html( o.match )
			.append( testNode );
			targetOffset = testNode.offset();
			
			// Why go on if everything's already hunkydory?
			if ( currentOffset.top <= targetOffset.top ) {
				node.html( html );
				return;
			};
			
			// Put the content back in and get offset of testNode
			// Normal offset is important when the node is inside something
			// that's floated. A full node could be causing the float to clear
			// another element, and perhaps that's why we're truncating it.
			node.append( html );
			normalOffset = testNode.offset();
			
			// If browser has not given us a useful lineHeight, calculate it
			if ( !lineHeight ) {
				testNode.before( '<br />' );
				lineOffset = testNode.offset();
				lineHeight = lineOffset.top - normalOffset.top;
			}
			
			// Lop.
			// Crude, but effective. When the text is big, roughly lop off the chunk
			// we don't need. 'm's are wider than 'i's so we mustn't be too brutal
			// with the lopping-off factor. 3 is a good.
			if ( currentOffset.top !== normalOffset.top ) { 
			  lines = Math.ceil( (currentOffset.top - normalOffset.top) / lineHeight );
			  length = Math.ceil( length / lines ) * 3;
			}
			
			// Iterate.
			// Reduce length by letter
			while ( length-- && currentOffset.top > targetOffset.top ) {
				
				// Reduce length by word
				if ( o.truncateByWord ) {
					
					// TODO: make this test regex for non-word characters
					while ( length-- && html[ length ] !== ' ' ) {}
				}
				
				newHtml = html.slice(0, length) + o.marker;
				node
				.html( newHtml )
				.append( testNode );
				
				currentOffset = testNode.offset();
			}
			
			testNode.remove();
		});
	};
})();