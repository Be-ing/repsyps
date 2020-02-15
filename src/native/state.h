#include <napi.h>
#include "portaudio.h"
#include <unordered_map> 
#include <vector>

#ifndef STATE_HEADER_H
#define STATE_HEADER_H

typedef struct{
  float volume;
  double time;
  bool playing;
  int period;
  double out;
} playback;

typedef struct{
  std::string sourceId;
  float volume;
  std::vector<int> chunks;
  std::vector<int> nextChunks;
  float alpha;
  bool playing;
  bool aperiodic;
  int chunkIndex;
  double sample;
} mixTrack;


typedef struct{
  std::vector<float*>  channels;
  int length;
} source;

typedef struct{
  std::vector<float*>  channels;
  int size;
  int head;
  int tail;
} ringbuffer;

typedef struct{
  ringbuffer *buffer;
  float *window;
  unsigned int windowSize;
  playback *playback;
  std::unordered_map<std::string, mixTrack*> mixTracks;
  std::unordered_map<std::string, source*> sources;
} streamState;

#endif