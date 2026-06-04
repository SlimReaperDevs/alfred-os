import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, SafeAreaView } from 'react-native';

const INTRO_TEXT = "I am Alfred — your personal system butler. I have been designed to serve one purpose: to ensure you become the finest version of yourself. Shall we commence?";

interface Props {
  onCommence: () => void;
}

export default function CinematicIntroScreen({ onCommence }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const [displayedText, setDisplayedText] = useState('');
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Crest fade in
    Animated.timing(fadeAnim, { toValue: 1, duration: 1500, useNativeDriver: true }).start(() => {
      // Crest glow pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
        ])
      ).start();

      // Typewriter after 800ms
      setTimeout(() => {
        let i = 0;
        const interval = setInterval(() => {
          i++;
          setDisplayedText(INTRO_TEXT.slice(0, i));
          if (i >= INTRO_TEXT.length) {
            clearInterval(interval);
            setTimeout(() => setShowButton(true), 600);
          }
        }, 28);
      }, 800);
    });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#060608] items-center justify-center px-8">
      {/* Heraldic Crest */}
      <Animated.View style={{ opacity: fadeAnim }} className="items-center mb-12">
        <Animated.View style={{ opacity: glowAnim }}
          className="w-24 h-24 rounded-full border-2 border-[#c9a84c] items-center justify-center"
          style={[{ opacity: glowAnim }, { shadowColor: '#c9a84c', shadowOpacity: 0.8, shadowRadius: 20, elevation: 10 }]}
        >
          <Text className="text-[#c9a84c] text-5xl font-bold">A</Text>
        </Animated.View>
        <Text className="text-[#c9a84c] font-mono text-xs tracking-widest uppercase mt-4">Alfred OS · v2.0</Text>
      </Animated.View>

      {/* Typewriter text */}
      <Animated.View style={{ opacity: fadeAnim }} className="items-center mb-12 px-4">
        <Text className="text-[#e8e8f0] text-base text-center leading-7" style={{ fontFamily: 'monospace' }}>
          {displayedText}
          {displayedText.length < INTRO_TEXT.length && (
            <Text className="text-[#c9a84c]">|</Text>
          )}
        </Text>
      </Animated.View>

      {/* Commence button */}
      {showButton && (
        <TouchableOpacity
          onPress={onCommence}
          activeOpacity={0.7}
          className="border border-[#c9a84c] px-12 py-4"
        >
          <Text className="text-[#c9a84c] font-mono text-sm tracking-widest uppercase">Commence →</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
