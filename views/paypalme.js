		paypal.Button.render({
	     	env: 'production',
	     	//- Or 'sandbox'

	     	commit: true,
	     	/*- Show a 'Pay Now' button*/

	     	style: 
	    		color: 'gold',
	    		size: 'small',

	    	payment: (data, actions),
	        /* 
	        	* Set up the payment here 
	        */

	    	onAuthorize: (data, actions),
	        /* 
	        	* Execute the payment here 
	        */

	    	onCancel: (data, actions),
	        /* 
	        	* Buyer cancelled the payment 
	         */

	    	onError: (err) 
	        /* 
	        	* An error occurred during the transaction 
	        */
	   	},'#paypal-button')