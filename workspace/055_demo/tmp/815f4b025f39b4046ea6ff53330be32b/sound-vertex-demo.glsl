#version 300 es

precision highp float;

uniform float uBlockOffset;

uniform float uSampleRate;

out vec2 vSound;

#define BPM 120.

#define PI 3.1415

#define TAU 6.2831

#define T1 1.

#define T2 2.

#define T4 4.

#define T8 8.

#define T16 16.

#define T32 32.

#define N2(a, b) (a | (b << 8))

#define N3(a, b, c) (a | (b << 8) | (c << 16))

#define N4(a, b, c, d) (a | (b << 8) | (c << 16) | (d << 24))

#define O(a) 0, a

#define S(a) 1, a


/*

#define CM2(a) N3(36, 40, 43), a

#define DM2(a) N3(38, 42, 45), a

#define Em2(a) N3(40, 43, 47), a

#define Fshdim2(a) N3(42, 45, 48), a

#define GM2(a) N3(43, 47, 50), a

#define Am2(a) N3(45, 48, 52), a

#define Bm2(a) N3(47, 50, 54), a

#define CM3(a) N3(48, 52, 55), a

#define DM3(a) N3(50, 54, 57), a

#define Em3(a) N3(52, 55, 59), a

#define Fshdim3(a) N3(53, 56, 59), a

#define GM3(a) N3(55, 59, 62), a

#define Am3(a) N3(57, 60, 64), a

#define Bm3(a) N3(59, 62, 66), a

#define CM4(a) N3(60, 64, 67), a

#define DM4(a) N3(62, 66, 69), a

#define Em4(a) N3(64, 67, 71), a

#define Fshdim4(a) N3(65, 68, 71), a

#define GM4(a) N3(67, 71, 74), a

#define Am4(a) N3(69, 72, 76), a

#define Bm4(a) N3(71, 74, 78), a

#define CM5(a) N3(72, 76, 79), a

#define DM5(a) N3(74, 78, 81), a

#define Em5(a) N3(76, 79, 83), a

#define Fshdim5(a) N3(77, 80, 83), a

#define GM5(a) N3(79, 83, 86), a

#define Am5(a) N3(81, 84, 88), a

#define Bm5(a) N3(83, 86, 90), a

#define CM6(a) N3(84, 88, 91), a

#define DM6(a) N3(86, 90, 93), a

#define Em6(a) N3(88, 91, 95), a

*/

/*

MIDI Number,Note Name,Frequency

21,A0,27.5

22,A#0,29.14

23,B0,30.87

24,C1,32.7

25,C#1,34.65

26,D1,36.71

27,D#1,38.89

28,E1,41.2

29,F1,43.65

30,F#1,46.25

31,G1,49.0

32,G#1,51.91

33,A1,55.0

34,A#1,58.27

35,B1,61.74

36,C2,65.41

37,C#2,69.3

38,D2,73.42

39,D#2,77.78

40,E2,82.41

41,F2,87.31

42,F#2,92.5

43,G2,98.0

44,G#2,103.83

45,A2,110.0

46,A#2,116.54

47,B2,123.47

48,C3,130.81

49,C#3,138.59

50,D3,146.83

51,D#3,155.56

52,E3,164.81

53,F3,174.61

54,F#3,185.0

55,G3,196.0

56,G#3,207.65

57,A3,220.0

58,A#3,233.08

59,B3,246.94

60,C4,261.63

61,C#4,277.18

62,D4,293.66

63,D#4,311.13

64,E4,329.63

65,F4,349.23

66,F#4,369.99

67,G4,392.0

68,G#4,415.3

69,A4,440.0

70,A#4,466.16

71,B4,493.88

72,C5,523.25

73,C#5,554.37

74,D5,587.33

75,D#5,622.25

76,E5,659.26

77,F5,698.46

78,F#5,739.99

79,G5,783.99

80,G#5,830.61

81,A5,880.0

82,A#5,932.33

83,B5,987.77

84,C6,1046.5

85,C#6,1108.73

86,D6,1174.66

87,D#6,1244.51

88,E6,1318.51

89,F6,1396.91

90,F#6,1479.98

91,G6,1567.98

92,G#6,1661.22

93,A6,1760.0

94,A#6,1864.66

95,B6,1975.53

96,C7,2093.0

97,C#7,2217.46

98,D7,2349.32

99,D#7,2489.02

100,E7,2637.02

101,F7,2793.83

102,F#7,2959.96

103,G7,3135.96

104,G#7,3322.44

105,A7,3520.0

106,A#7,3729.31

107,B7,3951.07

108,C8,4186.01

*/

#define F2(a) 41, a

#define Fsh2(a) 42, a

#define G2(a) 43, a

#define A2(a) 45, a

#define Ash2(a) 46, a

#define B2(a) 47, a

#define C3(a) 48, a

#define D3(a) 50, a

#define Dsh3(a) 51, a

#define E3(a) 52, a

#define F3(a) 53, a

#define Fsh3(a) 54, a

#define G3(a) 55, a

#define A3(a) 57, a

#define Ash3(a) 58, a

#define B3(a) 59, a

#define C4(a) 60, a

#define Csh3(a) 61, a

#define D4(a) 62, a

#define Dsh4(a) 63, a

#define E4(a) 64, a

#define F4(a) 65, a

#define Fsh4(a) 66, a

#define G4(a) 67, a

#define A4(a) 69, a

#define Ash4(a) 70, a

#define B4(a) 71, a

#define Gm3(a) N3(55, 61, 62), a 
#define Gm3I1(a) N3(46, 50, 55), a 
#define Gm3I2(a) N3(50, 55, 57), a 
#define FM3I2(a) N3(48, 53, 57), a 
#define Dm3(a) N3(50, 53, 57), a 
#define Cm3(a) N3(48, 51, 55), a 
#define DshMI2(a) N3(46, 51, 55), a 

vec4 noise(float p) {

    vec4 p4 = fract(vec4(p) * vec4(.1050, .1030, .0973, .1099));

    p4 += dot(p4, p4.wzxy + 55.33);

    return fract((p4.xxyz + p4.yzzw) * p4.zywx);

}

float noise2(float phi) { return fract(sin(phi * 0.055753) * 122.3762) * 4.0 - 3.0; }

float quan(float s, float c) {

    return floor(s / c) * c;

}

float nse(float x) {

    return fract(sin(x * 110.082) * 19871.8972);

}

float dist(float s, float d) {

    return clamp(s * d, -1., 1.);

}

float timeToBeat(float time) {

    return time / 60. * BPM;

}

float beatToTime(float beat) {

    return beat / BPM * 60.;

}

#define BEAT_TO_TIME(beat) beat / BPM * 60.

float noteToFreq(float n) {

    return 440. * pow(2., (n - 69.) / 12.);

}

float sine(float freq, float time) {

    return sin(freq * TAU * time);

}

float sine(float phase) {

    return sin(TAU * phase);

}

float rhy(float time, float fade) {

    return pow(fract(-time), 6. - fade * 3.);

}

vec2 delay(float time, float dt) {

    return exp(-2. * dt) * sin(6.4831 * 440. * time) * vec2(rhy(time - dt * .3, dt), rhy(time - dt * .5, dt));

}

float saw(float note, float phase) {

    return 2. * fract(phase) - 1.;

}

float square(float phase) {

    return fract(phase) < .5 ? -1. : 1.;

}

float triangle(float phase) {

    return 1. - 4. * abs(fract(phase) - .5);

}


float lowPassFilter(float inp, float cut_lp, float res_lp) {

    float n1 = 0.0;

    float n2 = 0.0;

    float n3 = 0.0;

    float n4 = 0.0;

    float fb_lp = 0.0;

    float fb_hp = 0.0;

    float hp = 0.0;

    float p4=1.0e-24;

    fb_lp 	= res_lp+res_lp/(1.0-cut_lp + 1e-20);

    n1 		= n1+cut_lp*(inp-n1+fb_lp*(n1-n2))+p4;

    n2		= n2+cut_lp*(n1-n2);

    return n2;

}

float base( float note, float time )

{

    float freq = noteToFreq(note);

    float ph = 1.0;

    ph *= sin(6.283185*freq*time*2.0);

    ph *= 0.5+0.5*max(0.0,5.0-0.01*freq);

    ph *= exp(-time*freq*0.2);

    float y = 0.0;

    y += 0.70*sin(1.00*TAU*freq*time+ph)*exp2(-0.7*0.007*freq*time);

    y += 0.20*sin(2.01*TAU*freq*time+ph)*exp2(-0.7*0.011*freq*time);

    y += 0.20*sin(3.01*TAU*freq*time+ph)*exp2(-0.7*0.015*freq*time);

    y += 0.16*sin(4.01*TAU*freq*time+ph)*exp2(-0.7*0.018*freq*time);

    y += 0.13*sin(5.01*TAU*freq*time+ph)*exp2(-0.7*0.021*freq*time);

    y += 0.10*sin(6.01*TAU*freq*time+ph)*exp2(-0.7*0.027*freq*time);

    y += 0.09*sin(8.01*TAU*freq*time+ph)*exp2(-0.7*0.030*freq*time);

    y += 0.07*sin(9.01*TAU*freq*time+ph)*exp2(-0.7*0.033*freq*time);

    y += 0.35*y*y*y;

    y += 0.10*y*y*y;

    y *= 1.0 + 1.5*exp(-8.0*time);

    y *= clamp( time/0.004, 0.0, 1.0 );

    y *= 2.5-1.5*clamp( log2(freq)/10.0,0.0,1.0);

    y *= .1;

    return y;

}


vec2 kick(float note, float time) {

    
    
    

    float amp = exp(-3.2 * time);

    float phase = 35. * time - 16. * exp(-60. * time);

    return vec2(amp * sine(phase));

}

vec2 kickAttack(float note, float t) {

    float i = t * uSampleRate;

    float env = exp(-t * 28.);

    float v = .5 * env * (.7 * noise2(i) + .38 * sin(45. * i));

    return vec2(v);

}

vec2 hihat1(float note, float time) {

    float amp = exp(-50. * time);

    return amp * noise(time * 100.).xy;

}

vec2 hihat2(float note, float time) {

    float amp = exp(-70. * time);

    return amp * noise(time * 300.).xy;

}

vec2 snare(float note, float t) {

    float i = t * uSampleRate;

    float env = exp(-t * 17.);

    float v = .3 * env * (2.3 * noise2(i) + .5 * sin(30. * i));

    return vec2(v);

}

vec2 snareFill(float note, float t) {

    float i = t * uSampleRate;

    float env = exp(-t * 30.);

    float v = .2 * env * (2.3 * noise2(i) + .5 * sin(30. * i));

    return vec2(v);

}

vec2 crash1(float note, float time) {

    float aa = 15.;

    time = sqrt(time * aa) / aa;

    float amp = exp(max(time - .15, 0.) * -5.);

    float v = nse(quan(mod(time, .6), .0001));

    v = dist(v, .1) * amp;

    return vec2(dist(v * amp, 2.));

}


#define NSPC 256

vec2 dist(vec2 s, float d) { return clamp(s * d, -1.0, 1.0); }

float _filter(float h, float cut) {

    cut -= 20.0;

    float df = max(h - cut, 0.0), df2 = abs(h - cut);

    return exp(-0.005 * df * df) * 0.5 + exp(df2 * df2 * -0.1) * 2.2;

}

vec2 attackbass(float note, float t) {

    vec2 v = vec2(0.0);

    float dr = 0.15;

    float amp = smoothstep(0.1, 0.0, abs(t - dr - 0.1) - dr) * exp(t * 0.2);

    float f = noteToFreq(note);

    float sqr = 0.1;

    float base = f;

    float flt = exp(t * -1.5) * 30.0;

    for (int i = 0; i < NSPC; i++) {

        float h = float(i + 1);

        float inten = 2.0 / h;

        inten = mix(inten, inten * mod(h, 2.0), sqr);

        inten *= exp(-2.0 * max(2.0 - h, 0.0));  

        inten *= _filter(h, flt);

        v.x += inten * sin((TAU + 0.01) * (t * base * h));

        v.y += inten * sin(TAU * (t * base * h));

    }

    float o = v.x * amp;  

    

    return vec2(dist(v * amp, 2.0));

}

vec2 leadsub(float note, float t) {

    vec2 v = vec2(0.0);

    float dr = 0.1;

    float amp = smoothstep(0.2, 0.0, abs(t - dr - 0.1) - dr) * exp(t * 0.2);

    float f = noteToFreq(note);

    float sqr = 0.03;

    float base = f;

    float flt = exp(t * -3.5) * 20.0;

    for (int i = 0; i < NSPC; i++) {

        float h = float(i + 1);

        float inten = 2.0 / h;

        inten = mix(inten, inten * mod(h, 2.0), sqr);

        inten *= exp(-2.0 * max(2.0 - h, 0.0));

        inten *= _filter(h, flt);

        v.x += inten * sin((TAU + 0.01) * (t * base * h));

        v.y += inten * sin(TAU * (t * base * h));

    }

    float o = v.x * amp;

    return vec2(dist(v * amp, 2.0));

}

vec2 leadsub2(float note, float t) {

    vec2 v = vec2(0.0);

    float dr = 0.1;

    float amp = smoothstep(0.2, 0.0, abs(t - dr - 0.1) - dr) * exp(t * 0.2);

    float f = noteToFreq(note);

    float sqr = 0.05;

    float base = f;

    float flt = exp(t * -2.5) * 20.0;

    for (int i = 0; i < NSPC; i++) {

        float h = float(i + 1);

        float inten = 4.0 / h;

        inten = mix(inten, inten * mod(h, 2.0), sqr);

        inten *= exp(-3.0 * max(1.9 - h, 0.0));

        inten *= _filter(h, flt);

        v.x += inten * sin((TAU + 0.01) * (t * base * h));

        v.y += inten * sin(TAU * (t * base * h));

    }

    float o = v.x * amp;

    return vec2(dist(v * amp, 2.0));

}

vec2 synth(float note, float t) {

    vec2 v = vec2(0.0);

    float dr = 0.15;

    float amp = smoothstep(0.1, 0.0, abs(t - dr - 0.1) - dr) * exp(t * 0.2);

    float f = noteToFreq(note);

    float sqr = 0.1;

    float base = f;

    float flt = exp(t * -1.5) * 30.0;

    for (int i = 0; i < NSPC; i++) {

        float h = float(i + 1);

        float inten = 2.0 / h;

        inten = mix(inten, inten * mod(h, 2.0), sqr);

        inten *= exp(-2.0 * max(2.0 - h, 0.0));

        inten *= _filter(h, flt);

        v.x += inten * sin((TAU + 0.01) * (t * base * h));

        v.y += inten * sin(TAU * (t * base * h));

    }

    float o = v.x * amp;

    return vec2(dist(v * amp, 2.0));

}

vec2 bass(float note, float time) {

    float freq = noteToFreq(note);

    return vec2(square(freq * time) + sine(freq * time)) / 1.5;

}

vec2 pad(float note, float time) {

    float freq = noteToFreq(note);

    float vib = .2 * sine(3. * time);

    return vec2(

    saw(1., freq * .99 * time + vib),

    saw(1., freq * 1.01 * time + vib)

    );

}

vec2 arp(float note, float time) {

    float freq = noteToFreq(note);

    float fmamp = .1 * exp(-50. * time);

    float fm = fmamp * sine(time * freq * 7.);

    
    float amp = exp(-20. * time);

    return amp * vec2(

    sine(freq * .99 * time + fm),

    sine(freq * 1.01 * time + fm)

    );

}


#define msin(x,m) sin(TAU*(x)+(m))

float cps(float notenumber)

{

    
    return 440.*exp2((notenumber-69.)/12.);

}

vec2 epiano(float note, float t)

{

    float nuance = 1.;

    float freq = cps(note);

    
    
    
    vec2 f0 = vec2(freq*0.998, freq*1.002);

    
    
    
    vec2 glass = msin((f0+3.)*t, msin(14.*f0*t,0.) * exp(-30.*t) * nuance) * exp(-4.*t)  * nuance;

    glass = sin(glass); 

    
    
    vec2 body = msin(f0*t, msin(f0*t,0.) * exp(-0.5*t) * nuance * pow(440./f0.x, 0.5)) * exp(-t) * nuance;

    
    float panDir = clamp(log2(freq/400.)/2., -1., 1.); 
    vec2 pan = normalize(vec2(0.5-0.5*panDir, 0.5+0.5*panDir));

    return (glass*pan + body) * 0.05 * smoothstep(0.,0.001,t);

}

#define SEQUENCER(rawBeat,time,beatTempo,totalBeatCount,notes,noteCount,toneFunc)float tempoScale=beatTempo/4.;float fLocalBeatIndex=mod(rawBeat*tempoScale,float(totalBeatCount));int accRawBeatPrevLength=0;int accRawBeatLength=0;int targetNoteIndex=-1;for(int i=0;i<noteCount;i++){if(i==0){int rawNoteLength=notes[i*2+1];if(0.<fLocalBeatIndex&&fLocalBeatIndex<float(rawNoteLength)){targetNoteIndex=0;accRawBeatLength+=rawNoteLength;break;}accRawBeatLength+=rawNoteLength;}else{int rawNoteLength=notes[(i-1)*2+1];int nextRawNoteNumber=notes[i*2];int nextRawNoteLength=notes[i*2+1];if( float(accRawBeatLength)<fLocalBeatIndex&&fLocalBeatIndex<(float(accRawBeatLength)+float(nextRawNoteLength))){targetNoteIndex=i;accRawBeatPrevLength=accRawBeatLength;accRawBeatLength+=nextRawNoteLength;break;}accRawBeatPrevLength=accRawBeatLength;accRawBeatLength+=nextRawNoteLength;}}int currentNoteNumber=notes[targetNoteIndex*2];int currentNoteLength=notes[targetNoteIndex*2+1];int[4]noteNumbers=int[4]( (int(currentNoteNumber)&255),((int(currentNoteNumber)>>8)&255),((int(currentNoteNumber)>>16)&255),((int(currentNoteNumber)>>24)&255));if(targetNoteIndex==-1){return vec2(0.);}float fLocalBeatIndexInNote=fLocalBeatIndex-float(accRawBeatPrevLength);float localTime=BEAT_TO_TIME(mod(fLocalBeatIndexInNote,float(currentNoteLength))/tempoScale);float fallbackAmp=1.-smoothstep(.1,.2,fLocalBeatIndexInNote/float(currentNoteLength));fallbackAmp=1.;vec2 res=vec2(0.);float acc=0.;for(int i=0;i<4;i++){float fNoteNumber=float(noteNumbers[i]);float isNoteOn=(fNoteNumber>0.?1.:0.);res+=vec2(toneFunc(fNoteNumber,localTime))*isNoteOn*fallbackAmp;acc+=isNoteOn;}float gainAcc=1.5;res/=max(1.,acc-gainAcc);


vec2 epianoHarmonySeqBase(float rawBeat, float time) {

    int[24] notes = int[24](

        G3(6), G3(6), G3(4),

        F3(6), F3(6), F3(4),

        Dsh3(6), Dsh3(6), Dsh3(6),

        Dsh3(6), G3(2), F3(6)

    );

    SEQUENCER(rawBeat, time, T16, 64., notes, 12, epiano);

    return res * 3.;

}

vec2 epianoHarmonySeqHook(float rawBeat, float time) {

    int[40] notes = int[40](

        Gm3I2(4), F3(2), Gm3I1(4), D3(2), G3(4),

        FM3I2(4), D3(2), Dm3(4), F3(2), F3(4),

        Cm3(4), F3(2), DshMI2(4), F3(2), Dsh3(4),

        F3(2), Dsh3(6), G3(2), F3(2), FM3I2(4)

    );

    
    SEQUENCER(rawBeat, time, T16, 64., notes, 20, epiano);

    return res * 3.;

}

vec2 synthHarmonySeqBase(float rawBeat, float time) {

    int[4] notes = int[4](

        G3(12), O(4)

    );

    SEQUENCER(rawBeat, time * .1, T8, 8., notes, 2, synth);

return res * 1.;

}

vec2 snareFillIntroSeq(float rawBeat, float time) {

    int[16] notes = int[16](

        S(1), S(1), S(1), S(1),

        S(1), S(1), S(1), S(1)

    );

    

    SEQUENCER(rawBeat, time, T4, 8., notes, 8, snareFill);

    return res * .15;

}

vec2 arpBaseLoopSeqBase(float rawBeat, float time) {

    int[56] notes = int[56](

        G3(1), G3(1), A3(1), G3(1), G3(1), B3(1), O(2),

        G3(1), G3(1), A3(1), G3(1), G3(1), B3(1), O(2),

        Dsh3(1), Dsh3(1), F3(1), Dsh3(1), Dsh3(1), G3(1), O(2),

        Dsh3(1), Dsh3(1), F3(1), Dsh3(1), Dsh3(1), G3(1), O(2)

    );

    
    SEQUENCER(rawBeat, time, T8, 32., notes, 28, arp);

    return res * .1;

}

vec2 kickSeqBase(float rawBeat, float time) {

    int[32] notes = int[32](

        S(1), O(1), S(1), O(1),

        S(1), O(1), S(1), O(1),

        S(1), O(1), S(1), O(1),

        S(1), O(1), S(1), O(1)

    );

    

    SEQUENCER(rawBeat, time, T8, 16., notes, 16, kick);

    return res * .05;

}

vec2 bassSeqBase(float rawBeat, float time) {

    int[38] notes = int[38](

    
    
    G3(3), G3(1), O(1), G3(2), O(1),

    G3(3), G3(1), O(1), A3(2), O(1),

    G3(3), G3(1), O(1), G3(2), O(1),

    G3(3), A3(2), G3(2), O(1)

    );

    SEQUENCER(rawBeat, time, T8, 32., notes, 19, bass);

    return vec2(res) * .05;

    
}


vec2 bassLowSeqBase(float rawBeat, float time) {

    int[8] notes = int[8](

    G2(8), F2(8),

    Ash2(8), A2(8)

    );

    SEQUENCER(rawBeat, time, T8, 32., notes, 4, bass);

return vec2(res) * .05;

}


vec2 bassHighSeqBase(float rawBeat, float time) {

    int[8] notes = int[8](

    G4(8), F4(8),

    Ash4(8), A4(8)

    );

    SEQUENCER(rawBeat, time, T8, 32., notes, 4, bass);

return vec2(res) * .05;

}


vec2 hihat1BaseLoopSeq(float rawBeat, float time) {

    int[24] notes = int[24](

        S(1), O(3),

        S(1), S(1), O(2),

        S(1), O(1), S(1), S(1),

        O(1), S(1), O(2)

    );

    SEQUENCER(rawBeat, time, T16, 16., notes, 12, hihat1);

return res * .5;

}

float powNoise( float _freq, float _phase ) {

    if ( _phase < 0.0 ) { return 0.0; }

    float p = mod( _phase * _freq, 1.0 ) + noise( _phase * 1.45 ).x * 0.01;

    return ( ( p < 0.4 ? -0.1 : 0.1 ) + sin( p * TAU ) * 0.7 );

}

float beatToMeasure(float beat) {

    return beat * .25;

}

vec2 bowan(float time) {

    vec2 freq = vec2(500., 560);

    return (sin(time * freq) * sin(time * 2400.) + sin(time * freq * 2.4)) * exp(-fract(time/ 4.) * 5.) * .05;

}

vec2 fmWave(float time) {

    vec2 freq = vec2(600., 660);

    return (sin(time * freq) * sin(time * 100.) + sin(time * freq * 1.5)) * .;

}

vec2 mainSound(float time) {

    float beat = timeToBeat(time);

    
    

    vec2 sound = vec2(0.);

    float measure = beatToMeasure(beat);

    sound += bowan(time);

    

    if(8. <= measure) {

        sound += fmWave(time);

    }

    
    
    
    
    
    
    
    
    
    
    
    
    
    

    if(0. <= measure && measure < 8.) {

    } else if(8. <= measure && measure < 16.) {

        sound +=

            0.

            + epianoHarmonySeqBase(beat, time)

            ;

    } else if(16. <= measure && measure < 24.) {

        vec2 freq = vec2(1500., 1510);

        sound +=

            0.

            + epianoHarmonySeqBase(beat, time)

            
            + hihat1BaseLoopSeq(beat, time)

            ;

    } else if(24. <= measure && measure < 32.) {

        sound +=

            0.

            + epianoHarmonySeqBase(beat, time)

            + bassLowSeqBase(beat, time)

            ;

    } else if(32. <= measure && measure < 40.) {

        sound +=

            0.

            + epianoHarmonySeqHook(beat, time)

            + bassLowSeqBase(beat, time)

            ;

    } else if(40. <= measure && measure < 48.) {

        sound +=

            0.

            + epianoHarmonySeqBase(beat, time)

            + bassHighSeqBase(beat, time)

            + hihat1BaseLoopSeq(beat, time)

            ;

    } else if(40. <= measure && measure < 48.) {

    } else if(48. <= measure && measure < 56.) {

    } else if(56. <= measure && measure < 72.) {

    } else if(72. <= measure && measure < 80.) {

    }

    return sound;

    

    

    return epianoSeqBase(beat, time);

    return epianoMelodyMainSeq(beat, time);

    return baseIntroSeq(beat, time);

    return epianoHarmonyBaseSeq(beat, time);

    if(0. <= measure && measure < 8.) { 
        sound +=

        0.

        
        + baseIntroSeq(beat, time)

        
        ;

    } else if(8. <= measure && measure < 16.) {

        sound +=

        0.

        + bassBaseLoopSeq(beat, time)

        + baseIntroSeq(beat, time)

        + epianoMelodyLoopBaseSeq(beat, time)

        + snareFillIntroSeq(beat, time)

        + arpBaseLoopSeqBase(beat, time)

        + hihat1BaseLoopSeq(beat, time)

        ;

    } else if(16. <= measure && measure < 24.) {

        sound +=

        0.

        + bassBaseLoopSeq(beat, time)

        + epianoMelodyLoopBaseSeq(beat, time)

        + baseIntroSeq(beat, time)

        + epianoHarmonySeqBase(beat, time)

        + arpBaseLoopSeqBase(beat, time)

        + snareFillHookSeq(beat, time)

        ;

    } else if(32. <= measure && measure < 40.) {

    } else if(48. <= measure && measure < 56.) {

    } else if(56. <= measure && measure < 64.) {

    } else if(64. <= measure && measure < 72.) {

    } else if(72. <= measure && measure < 80.) {

    } else {

        sound = vec2(0.);

    }

    return sound;

    return epianoHarmonySeqBase(beat, time);

    sound +=

    bassSeqBase(beat, time)

    + epianoSeqBase(beat, time)

    + epianoHarmonySeqBase(beat, time)

    + arpSeqBase(beat, time)

    + kickSeqBase(beat, time)

    
    + snareFillSeqBase(beat, time);

    
    
    
    
    
    
    

    return sound;

}

void main() {

    float time = uBlockOffset + float(gl_VertexID) / uSampleRate;

    

    
    
    vec2 c = vec2(1.);

    c =

        1.

        
        * snareFill(time, time)

        * base(time, time)

        * snareFill(time, time)

        * arp(time, time)

        * hihat1(time, time)

        * bass(time, time)

        * epiano(time, time)

        * kick(time, time)

        * pad(time, time)

        * attackbass(time, time)

        * leadsub(time, time)

        * leadsub2(time, time)

        * synth(time, time)

        * saw(time, time)

    * vec2(1.);

    c.x = 1.;

    c.y = 1.;

    

    vSound = mainSound(time) * c;

    

    
}