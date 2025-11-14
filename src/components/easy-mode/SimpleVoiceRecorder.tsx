import React, { useState, useRef } from "react";
import { Button } from "../ui/button";
import {
  Mic,
  Square,
  Play,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type RecordingStatus = "idle" | "recording" | "stopped";

interface SimpleVoiceRecorderProps {
  onTranscriptComplete: (text: string) => void;
}

export function SimpleVoiceRecorder({
  onTranscriptComplete,
}: SimpleVoiceRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudio, setRecordedAudio] =
    useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(
    null,
  );
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(
    null,
  );

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, {
          type: "audio/webm",
        });
        setRecordedAudio(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setRecordedUrl(url);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecordingStatus("recording");
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.success("녹음이 시작되었습니다.");
    } catch (error) {
      console.error("녹음 시작 실패:", error);
      toast.error("마이크 권한을 허용해주세요.");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      recordingStatus === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setRecordingStatus("stopped");

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      toast.success("녹음이 완료되었습니다.");
    }
  };

  const playRecording = () => {
    if (recordedUrl) {
      const audio = new Audio(recordedUrl);
      audio.play();
    }
  };

  const deleteRecording = () => {
    setRecordedAudio(null);
    setRecordedUrl(null);
    setRecordingStatus("idle");
    setRecordingTime(0);
    toast.success("녹음이 삭제되었습니다.");
  };

  const transcribeAudio = async () => {
    if (!recordedAudio) return;

    setIsTranscribing(true);

    // Mock 음성 인식 (실제로는 API 호출)
    setTimeout(() => {
      const mockTranscript =
        "오늘은 정말 좋은 하루였다. 친구들과 맛있는 점심을 먹고 카페에서 수다를 떨었다. 날씨도 좋아서 기분이 좋았다.";
      onTranscriptComplete(mockTranscript);
      setIsTranscribing(false);
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* 녹음 버튼 */}
      <div className="flex flex-col items-center gap-6 py-8">
        {recordingStatus === "idle" && (
          <Button
            onClick={startRecording}
            className="w-48 h-48 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#7B8B4F" }}
          >
            <Mic className="w-60 h-60" style={{ transform: "scale(5)", transformOrigin: "center" }} />
          </Button>
        )}

        {recordingStatus === "recording" && (
          <>
            <div
              className="text-4xl font-mono"
              style={{ color: "#E74C3C" }}
            >
              {formatTime(recordingTime)}
            </div>
            <Button
              onClick={stopRecording}
              className="w-48 h-48 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#E74C3C" }}
            >
              <Square className="w-16 h-16" style={{ transform: "scale(3)", transformOrigin: "center" }} />
            </Button>
            <div className="flex items-center gap-3 animate-pulse">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#E74C3C" }}
              ></div>
              <span
                className="text-2xl"
                style={{ color: "#4A3228" }}
              >
                녹음 중...
              </span>
            </div>
          </>
        )}

        {recordingStatus === "stopped" && recordedAudio && (
          <>
            <div
              className="text-3xl font-mono"
              style={{ color: "#4A3228" }}
            >
              {formatTime(recordingTime)}
            </div>
            <div className="flex gap-4">
              <Button
                onClick={playRecording}
                className="w-20 h-20 rounded-full"
                style={{ backgroundColor: "#7B8B4F" }}
              >
                <Play className="w-10 h-10" style={{ transform: "scale(2)", transformOrigin: "center" }} />
              </Button>
              <Button
                onClick={deleteRecording}
                className="w-20 h-20 rounded-full"
                style={{ backgroundColor: "#E74C3C" }}
              >
                <Trash2 className="w-10 h-10" style={{ transform: "scale(2)", transformOrigin: "center" }} />
              </Button>
            </div>
            <Button
              onClick={transcribeAudio}
              disabled={isTranscribing}
              className="w-full text-2xl py-6 mt-4"
              style={{ backgroundColor: "#7B8B4F" }}
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  텍스트로 변환 중...
                </>
              ) : (
                "텍스트로 변환하기"
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}