Info about media recording : "https://niteshgoyal27390.medium.com/exploring-the-power-of-mediarecorder-api-a-guide-with-example-959bd8848454"

## Blob : 
Defination : A Blob (Binary Large Object) is used to represent binary data, such as audio or video.
Blob()
Returns a newly created Blob object which contains a concatenation of all of the data in the array passed into the constructor. 

# Text Encoder : 
TextEncoder does the reverse thing – converts a string into bytes.
let encoder = new TextEncoder();
encode(str) – returns Uint8Array from a string.

## Streams | All about it : 
Streaming involves breaking a resource that you want to receive over a network down into small chunks, then processing it bit by bit
The response body returned by a successful fetch request is a ReadableStream that can be read by a reader created with ReadableStream.getReader().

----------- SUB CONCEPTS : 

### Chunks
The data is read sequentially in small pieces called chunks. A chunk can be a single byte, or it can be something larger such as a typed array of a certain size. A single stream can contain chunks of different sizes and types.

### Locking
Only one reader can read a stream at a time; when a reader is created and starts reading a stream (an active reader), we say it is locked to it. If you want another reader to start reading your stream, you typically need to cancel the first reader before you do anything else (although you can tee streams, see the Teeing section below)

### Teeing
Even though only a single reader can read a stream at once, it is possible to split a stream into two identical copies, which can then be read by two separate readers. This is called teeing.

In JavaScript, this is achieved via the ReadableStream.tee() method — it outputs an array containing two identical copies of the original readable stream, which can then be read independently by two separate readers.

# Reading Data of Streams : 

1) Using a reader from getReader
async function readData(url) {
  const response = await fetch(url);
  // response is always a readableStream
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      // Do something with last chunk of data then exit reader
      return;
    }
    // Otherwise do something here to process current chunk
  }
}


OR --> response.body returns a ReadableStream, which is an async iterable.

2) Using for await of loop
async function readData(url) {
  const response = await fetch(url);
  for await (const chunk of response.body) {
    // Do something with each "chunk"
  }
  // Exit when done
}

3) Using .then() and function looping : 

const reader = (await fetch(url)).body.getReader();
function read () {
    reader.read().then((done, value) => {
        if(done) {
            return;
        }

        // do something with the value :

        read();
    })
}
read()

------- OR ------

fetch("http://example.com/somefile.txt")
  // Retrieve its body as ReadableStream
  .then((response) => {
    const reader = response.body.getReader();
    // read() returns a promise that resolves when a value has been received
    reader.read().then(function pump({ done, value }) {
      if (done) {
        // Do something with last chunk of data then exit reader
        return;
      }
      // Otherwise do something here to process current chunk

      // Read some more, and call this function again
      return reader.read().then(pump);
    });
  })
  .catch((err) => console.error(err));

# Creating our own Custom Readable Stream : 
const stream = new ReadableStream(
    // This first object is mandatory :
  {
    start(controller) {},

    // controller.close() to close the stream
    // controller.enqueue() to push chunk to the stream
    // The value inside enqueue must be in Uint8Array --> You can use Encoder for that

    --> start(controller) — A method that is called once, immediately after the ReadableStream is constructed. Inside this method, you should include code that sets up the stream functionality,

    pull(controller) {},

    --> pull(controller) — A method that, when included, is called repeatedly until the stream's internal queue is full. This can be used to control the stream as more chunks are enqueued.

    cancel() {},

    --> cancel() — A method that, when included, will be called if the app signals that the stream is to be cancelled (e.g., if ReadableStream.cancel() is called). The contents should do whatever is necessary to release access to the stream source.

    type, autoAllocateChunkSize, (optional)
  },

  // This second object is optional (rare use)
  {
    highWaterMark: 3,
    size: () => 1,
  },
);