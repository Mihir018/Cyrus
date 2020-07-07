try {
    ipfs.on('ready', async () => {
      // Parse the query string, we'll use this to pick a 'room topic'
      const query = queryString.parse(location.search)

      try {
        // Get this peer's id, to be used for communication
        const id = await ipfs.id()
        // Update view model
        viewModel.id(id.id)
      } catch (err) {
        console.error('Failed to get node ID', err)
        viewModel.error(err)
      }
      // Room id is from query string or if missing, use peer id
      const roomID = query.id ? query.id : viewModel.id
      // Create basic room for given room id
      const room = Room(ipfs, roomID)

      // Once the peer has subscribed to the room, we enable chat,
      // which is bound to the view model's subscribe
      room.on('subscribed', () => {
        // Update view model
        viewModel.subscribed(true)
      })

      // When we receive a message...
      room.on('message', (msg) => {
        // We parse the data (which is JSON)
        const data = JSON.parse(msg.data)
        // Update the msg name (default to anonymous)
        msg.name = data.name ? data.name : "anonymous"
        // Update the msg text (just for simplicity later)
        msg.text = data.text
        // Add this to _front_ of array to keep it at the bottom of display
        viewModel.messages.unshift(msg)
      })

      // Subscribe to message changes on our view model, likely the result
      // of user interaction
      viewModel.message.subscribe(async (text) => {
        // If we aren't actually subscribed or there's no text, skip out
        if (!viewModel.subscribed() || !text) return
        try {
          // Get current name (this can be updated dynamically)
          const name = viewModel.name()
          // Broadcast the message to the entire room as a JSON string
          room.broadcast(Buffer.from(JSON.stringify({ name, text })))
        } catch(err) {
          console.error('Failed to publish message', err)
          viewModel.error(err)
        }
        // Empty message in view model
        viewModel.message('')
      })
      // Leave the room when we unload
      window.addEventListener('unload', async () => await room.leave())
    })


    try {
        ipfs.on('ready', async () => {
          const id = await ipfs.id()
          // Update view model
          viewModel.id(id.id)
          // Can also use query string to specify, see github example
          const roomID = "test-room-" + Math.random()
          // Create basic room for given room id
          const room = Room(ipfs, roomID)
          // Once the peer has subscribed to the room, we enable chat,
          // which is bound to the view model's subscribe
          room.on('subscribed', () => {
            // Update view model
            viewModel.subscribed(true)
          })
           // When we receive a message...
          room.on('message', (msg) => {
            const data = JSON.parse(msg.data) // Parse data (which is JSON)
            // Update msg name (default to anonymous)
            msg.name = data.name ? data.name : "anonymous"
            // Update msg text (just for simplicity later)
            msg.text = data.text
            // Add this to _front_ of array to keep at bottom
            viewModel.messages.unshift(msg)
          })
          // Subscribe to message changes on our view model, likely the result
          // of user interaction
          viewModel.message.subscribe(async (text) => {
            // If not actually subscribed or no text, skip out
            if (!viewModel.subscribed() || !text) return
            try {
              // Get current name
              const name = viewModel.name()
              // Get current message (one that initiated this update)
              const msg = viewModel.message()
              // Broadcast message to entire room as JSON string
              room.broadcast(Buffer.from(JSON.stringify({ name, text })))
            } catch(err) {
              console.error('Failed to publish message', err)
              viewModel.error(err)
            }
            // Empty message in view model
            viewModel.message('')
          })
          // Leave the room when we unload
          window.addEventListener('unload', async () => await room.leave())
        })  
  