//
//  sound.cc
//  node_sound
//
//  Created by Jorge@jorgechamorro.com on 2011-05-11.
//  Copyright 2011 Proyectos Equis Ka. All rights reserved.
//

/*
  TODO
  - Throw exceptions instead of just writing ERRORs to stderr.
  - provide a vumeter per sound
  - play callbacks (DONE)
  - bufferifySync(path) returns a buffer;
  - bufferify(path, cb) renders it in a background thread and calls cb(err, buffer) when done.
*/

#include <v8.h>
#include <node.h>
#include <node_buffer.h>
#include <ev.h>
#include <unistd.h>
#include <string.h>
#include <stdio.h>
#include <pthread.h>
#include <stdlib.h>

#include <AudioToolbox/AudioToolbox.h>
#include <CoreFoundation/CoreFoundation.h>


typedef struct playerStruct {

  int paused;
  long int id;
  int playing;
  int destroying;

  AudioQueueRef AQ;
  AudioStreamBasicDescription* format;
  v8::Persistent<v8::Object> JSObject;
} playerStruct;


static AudioStreamBasicDescription gFormat;
typedef Boolean macBoolean;

using namespace node;
using namespace v8;

typedef struct bufferStruct {
  void* buffer;
  ssize_t used;
  ssize_t size;
} bufferStruct;

#define kPlayCallbackQueueItemType 1
#define kRenderCallbackQueueItemType 2
#define kBufferListQueueItemType 3
#define kRenderJobsListQueueItemType 4
static ev_async eio_sound_async_notifier;

static v8::Persistent<String> volume_symbol;
static v8::Persistent<String> push_symbol;
static v8::Persistent<String> play_symbol;
static v8::Persistent<String> pause_symbol;
static v8::Persistent<Function> volume_function;
static v8::Persistent<Function> play_function;
static v8::Persistent<Function> push_function;
static v8::Persistent<Function> pause_function;

static v8::Persistent<String> id_symbol;
static v8::Persistent<String> data_symbol;
static v8::Persistent<String> hiddenPlayerPtr_symbol;

static long int createdCtr= 0;
static long int destroyedCtr= 0;
static long int wasPlayingCtr= 0;
// static long int playingNow= 0;





// ===============
// = newBuffer() =
// ===============

bufferStruct* newBuffer (ssize_t size) {
  bufferStruct* nuBuffer= (bufferStruct*) malloc(sizeof(bufferStruct));
  nuBuffer->buffer= malloc(size);
  nuBuffer->used= 0;
  nuBuffer->size= size;
  return nuBuffer;
}





// ===================
// = destroyBuffer() =
// ===================

void destroyBuffer (bufferStruct* buffer) {
  free(buffer->buffer);
  free(buffer);
}


// ===============
// = newPlayer() =
// ===============


playerStruct* newPlayer () {
  playerStruct* player;

  player= (playerStruct*) calloc(1, sizeof(playerStruct));
  V8::AdjustAmountOfExternalAllocatedMemory(sizeof(playerStruct));

  player->id= createdCtr++;

  player->format= &gFormat;

  player->paused= 0;
  player->playing= 0;
  player->destroying= 0;

  return player;
}




// =========================
// = **** DestroyerCB **** =
// =========================

void destroyerCB (v8::Persistent<Value> object, void* parameter) {

  OSStatus err;
  playerStruct* player= (playerStruct*) parameter;

  //fprintf(stderr, "\n*** destroyerCB() [%ld]", player->id);

  if (player->playing) {
    // Habrá que esperar a que termine antes de cargárselo...

    //fprintf(stderr, "\n[%ld] NOT_DESTROYED_WAS_PLAYING_OR_HAS_PENDING_CB", player->id);

    object.MakeWeak(player, destroyerCB);
    wasPlayingCtr++;
    goto end;
  }


  player->destroying= 1;
  err= AudioQueueDispose(player->AQ, true);
  if (err) {

    //fprintf(stderr, "\n[%ld] DESTROYING: AudioQueueDispose ERROR:[%d]", player->id, err);

    player->destroying= 0;
    object.MakeWeak((void*) player, destroyerCB);
    goto end;
  }
  else {

    //fprintf(stderr, "\n[%ld] DESTROYED", player->id);

    //V8::AdjustAmountOfExternalAllocatedMemory(-(2*player->bufferLength + sizeof(playerStruct)));
    free(player);
    object.Dispose();
    destroyedCtr++;
  }


  end:

  return;
}


// ======================================
// = **** AudioQueueBufferCallback **** =
// ======================================

void AQBufferCallback (void* priv, AudioQueueRef AQ, AudioQueueBufferRef AQBuffer) {

  // fprintf(stderr, "\nAQBufferCallback()");

  return;
}








// ====================
// = **** Create **** =
// ====================

v8::Handle<Value> Create (const Arguments &args) {

  // fprintf(stderr, "\nOK *** Player::Create() BEGIN");
  fflush(stderr);

  HandleScope scope;

  OSStatus err;
  playerStruct* player= newPlayer();

  err= AudioQueueNewOutput(
    player->format,          // const AudioStreamBasicDescription   *inFormat
    AQBufferCallback,                    // AudioQueueOutputCallback            inCallbackProc
    player,                  // void                                *inUserData
    NULL,                    // CFRunLoopRef                        inCallbackRunLoop
    kCFRunLoopDefaultMode,   // CFStringRef                         inCallbackRunLoopMode
    0,                       // UInt32                              inFlags
    &player->AQ              // AudioQueueRef                       *outAQ
  );

  if (err) {
    free(player);
    V8::AdjustAmountOfExternalAllocatedMemory((int) -sizeof(playerStruct));
    fprintf(stderr, "\nERROR *** Player::create AudioQueueNewOutput:[%d]\n", err);
    return ThrowException(Exception::TypeError(String::New("Player::create() AudioQueueNewOutput error")));
  }

  v8::Persistent<v8::Object> JSObject= v8::Persistent<v8::Object>::New(Object::New());
  JSObject.MakeWeak(player, destroyerCB);
  player->JSObject= JSObject;


  JSObject->Set(id_symbol, Integer::New(player->id));
  JSObject->Set(play_symbol, play_function);
  JSObject->Set(push_symbol, push_function);
  JSObject->Set(pause_symbol, pause_function);
  JSObject->Set(volume_symbol, volume_function);
  JSObject->SetHiddenValue(hiddenPlayerPtr_symbol, External::Wrap(player));


  if ((createdCtr % 500) == 0) {
    fprintf(stderr, "\nGC *** Player::create [Created:%ld, Destroyed:%ld, WerePlaying:%ld]\n", createdCtr, destroyedCtr, wasPlayingCtr);
  }

  return scope.Close(JSObject);
}


v8::Handle<Value> Push (const Arguments &args) {

  HandleScope scope;
  OSStatus err;
  AudioQueueBufferRef AQBuffer;

  if (args.Length() != 1) {
    return ThrowException(Exception::TypeError(String::New("Player::create(buffer): bad number of arguments")));
  }

  if (!Buffer::HasInstance(args[0])) {
    return ThrowException(Exception::TypeError(String::New("Player::create(buffer): The argument must be a Buffer() instance")));
  }

  playerStruct* player = (playerStruct*) (External::Unwrap(args.This()->ToObject()->GetHiddenValue(hiddenPlayerPtr_symbol)));

  Local<v8::Object> buffer= args[0]->ToObject();
  char* bufferData= Buffer::Data(buffer);
  size_t bufferLength= Buffer::Length(buffer);

  if (!bufferLength) {
    return ThrowException(Exception::TypeError(String::New("Player::create(buffer): buffer has length == 0")));
  }

  if (bufferLength < 8) {
    return ThrowException(Exception::TypeError(String::New("Player::create(buffer): buffer.length must be >= 8")));
  }

  if (bufferLength % 4) {
    return ThrowException(Exception::TypeError(String::New("Player::create(buffer): buffer.length must a multiple of 4")));
  }

  // fprintf(stderr, "bufferLength = %d\n", (int) bufferLength);

  err= AudioQueueAllocateBuffer (
    player->AQ,               // AudioQueueRef inAQ
    bufferLength,  // UInt32 inBufferByteSize
    &AQBuffer        // AudioQueueBufferRef *outBuffer
  );

  // fprintf(stdout, "\nplayer->AQBuffer: %p\n", &AQBuffer);

  if (err) {
    AudioQueueDispose (player->AQ, true);
    free(player);
    V8::AdjustAmountOfExternalAllocatedMemory((int) -sizeof(playerStruct));
    fprintf(stderr, "\nERROR *** Player::create AudioQueueAllocateBuffer:[%d]\n", err);
    return ThrowException(Exception::TypeError(String::New("Player::create(buffer) AudioQueueAllocateBuffer error")));
  }

  V8::AdjustAmountOfExternalAllocatedMemory(bufferLength);
  memcpy(AQBuffer->mAudioData, bufferData, bufferLength);
  AQBuffer->mAudioDataByteSize = bufferLength;

  // fprintf(stderr, "mAudioDataByteSize = %d\n", AQBuffer->mAudioDataByteSize);

  AQBuffer->mAudioDataByteSize = bufferLength;
  err = AudioQueueEnqueueBuffer(player->AQ, AQBuffer, 0, NULL);
  if (err) {
    fprintf(stderr, " ERROR:AudioQueueEnqueueBuffer:[%d]\n", err);
  }

  return scope.Close(args.This());

}







// ====================
// = **** Volume **** =
// ====================

v8::Handle<Value> Volume (const Arguments &args) {

  HandleScope scope;

  OSStatus err;
  double volume;

  playerStruct* player;
  player= (playerStruct*) (External::Unwrap(args.This()->ToObject()->GetHiddenValue(hiddenPlayerPtr_symbol)));

  if (args.Length() && args[0]->IsNumber()) {
    volume= args[0]->NumberValue();

    if (volume < 0) volume = 0;
    else if (volume > 1) volume = 1;

    err= AudioQueueSetParameter (player->AQ, kAudioQueueParam_Volume, (AudioQueueParameterValue) volume);
  }

  return scope.Close(args.This());
}





// ==================
// = **** Play **** =
// ==================

v8::Handle<Value> Play (const Arguments &args) {

  HandleScope scope;

  OSStatus err;
  playerStruct* player;

  player= (playerStruct*) (External::Unwrap(args.This()->GetHiddenValue(hiddenPlayerPtr_symbol)));

  if (player->paused) {
    player->paused= 0;
    player->playing= 1;

    err= AudioQueueStart(player->AQ, NULL);
    if (err) {
      fprintf(stderr, " ERROR:AudioQueueStart:[%d]\n", err);
    }

    goto end;
  }

  if (player->playing) goto end;

  //fprintf(stderr, "\n[%d] PLAY", player->id);
  //fflush(stderr);

  player->playing= 1;

  err = AudioQueueStart(player->AQ, NULL);
  if (err) {
    fprintf(stderr, " ERROR:AudioQueueStart:[%d]\n", err);
  }

  end:

  return scope.Close(args.This());
}











// ===================
// = **** Pause **** =
// ===================

v8::Handle<Value> Pause (const Arguments &args) {

  HandleScope scope;

  OSStatus err;
  playerStruct* player;
  player= (playerStruct*) (External::Unwrap(args.This()->ToObject()->GetHiddenValue(hiddenPlayerPtr_symbol)));

  //fprintf(stderr, "\n*** Player::pause [%ld]", player->id);

  if (player->paused) {
    //fprintf(stderr, " IGNORED_WAS_PAUSED");
    goto end;
  }

  if (!player->playing) {
    //fprintf(stderr, " IGNORED_WAS_NOT_PLAYING");
    goto end;
  }

  player->paused= 1;
  err= AudioQueuePause(player->AQ);
  if (err) {
    fprintf(stderr, " ERROR:AudioQueuePause:[%d]", err);
  }

  end:
  return scope.Close(args.This());
}





// =================================
// = **** Initialization code **** =
// =================================

// Esto se llama una sola vez, al hacer require('sound');
extern "C" {
  void init (v8::Handle<v8::Object> target) {

    HandleScope scope;

    volume_symbol= v8::Persistent<String>::New(String::New("volume"));
    push_symbol= v8::Persistent<String>::New(String::New("push"));
    play_symbol= v8::Persistent<String>::New(String::New("play"));
    // loop_symbol= v8::Persistent<String>::New(String::New("loop"));
    pause_symbol= v8::Persistent<String>::New(String::New("pause"));

    id_symbol= v8::Persistent<String>::New(String::New("id"));
    data_symbol= v8::Persistent<String>::New(String::New("data"));
    hiddenPlayerPtr_symbol= v8::Persistent<String>::New(String::New("_hiddenPlayerPtr"));

    volume_function= v8::Persistent<Function>::New(FunctionTemplate::New(Volume)->GetFunction());
    // loop_function= v8::Persistent<Function>::New(FunctionTemplate::New(Loop)->GetFunction());
    push_function= v8::Persistent<Function>::New(FunctionTemplate::New(Push)->GetFunction());
    play_function= v8::Persistent<Function>::New(FunctionTemplate::New(Play)->GetFunction());
    pause_function= v8::Persistent<Function>::New(FunctionTemplate::New(Pause)->GetFunction());

    target->Set(String::New("create"), v8::Persistent<Function>::New(FunctionTemplate::New(Create)->GetFunction()));
    // target->Set(String::New("stream"), v8::Persistent<Function>::New(FunctionTemplate::New(Stream)->GetFunction()));
    // target->Set(String::New("bufferify"), v8::Persistent<Function>::New(FunctionTemplate::New(Bufferify)->GetFunction()));
    // target->Set(String::New("bufferifySync"), v8::Persistent<Function>::New(FunctionTemplate::New(BufferifySync)->GetFunction()));

    // Start async events for callbacks.
    // ev_async_init(&eio_sound_async_notifier, Callback);
    ev_async_start(EV_DEFAULT_UC_ &eio_sound_async_notifier);
    ev_unref(EV_DEFAULT_UC);

    gFormat.mSampleRate= 44100;
    gFormat.mFormatID= kAudioFormatLinearPCM;
    gFormat.mFormatFlags= kLinearPCMFormatFlagIsSignedInteger | kAudioFormatFlagIsPacked;
    gFormat.mBytesPerPacket= 4;
    gFormat.mFramesPerPacket= 1;
    gFormat.mBytesPerFrame= 4;
    gFormat.mChannelsPerFrame= 2;
    gFormat.mBitsPerChannel= 16;

  }

  NODE_MODULE(player, init);
}
