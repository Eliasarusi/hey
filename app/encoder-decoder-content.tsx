"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { decode, encode } from "./encoding"
import { Button } from "@/components/ui/button"

export function Base64EncoderDecoderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") || "encode"
  const [inputText, setInputText] = useState("")
  const [selectedEmoji, setSelectedEmoji] = useState("") // ישמש כמפתח (תו בודד)
  const [outputText, setOutputText] = useState("")
  const [errorText, setErrorText] = useState("")

  const updateMode = (newMode: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("mode", newMode)
    router.replace(`?${params.toString()}`)
  }

  useEffect(() => {
    try {
      const isEncoding = mode === "encode"
      if (isEncoding && selectedEmoji === "") {
        setOutputText("")
        setErrorText("")
        return
      }
      // קריאה לפונקציית ההצפנה/פענוח
      let output = isEncoding
        ? encode(selectedEmoji, inputText)
        : decode(inputText)
      // הסרת תו בקרה U+000F בתחילת הפלט (אם קיים)
      output = output.replace(/^\u000F/, "")
      setOutputText(output)
      setErrorText("")
    } catch (e) {
      setOutputText("")
      setErrorText(`Error ${mode === "encode" ? "encoding" : "decoding"}: Invalid input`)
    }
  }, [mode, selectedEmoji, inputText])

  const handleModeToggle = (checked: boolean) => {
    updateMode(checked ? "encode" : "decode")
    setInputText("")
  }

  useEffect(() => {
    if (!searchParams.has("mode")) {
      updateMode("encode")
    }
  }, [searchParams])

  const isEncoding = mode === "encode"

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      setInputText(clipboardText)
    } catch (err) {
      console.error("Error reading clipboard:", err)
    }
  }

  return (
    <CardContent className="space-y-4">
      <p>
        כלי זה מאפשר לך לקודד הודעה נסתרת לאימוג'י או אות אלפבית. אַתָה יכול להעתיק ולהדביק טקסט עם הודעה נסתרת כדי לפענח את ההודעה.
      </p>
      <div className="flex items-center justify-center space-x-2">
        <Label htmlFor="mode-toggle">Decode</Label>
        <Switch id="mode-toggle" checked={isEncoding} onCheckedChange={handleModeToggle} />
        <Label htmlFor="mode-toggle">Encode</Label>
      </div>
      <div className="flex flex-col">
        <Textarea
          placeholder={isEncoding ? "Enter text to encode" : "Paste an emoji to decode"}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={handlePasteFromClipboard}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            הדבק מהלוח
          </button>
        </div>
      </div>

      {isEncoding && (
        <div className="flex flex-col">
          <Label htmlFor="single-character">הזן אות או אימוג'י (תו יחיד):</Label>
          <input
            id="single-character"
            type="text"
            value={selectedEmoji}
            onChange={(e) => {
              let newValue = ""
              // שימוש ב-Intl.Segmenter אם זמין לחלוקה נכונה למקטעי גרף (כדי לטפל באימוג'ים מורכבים)
              if (typeof Intl !== "undefined" && Intl.Segmenter) {
                const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" })
                const segments = Array.from(segmenter.segment(e.target.value), seg => seg.segment)
                newValue = segments.length > 0 ? segments[segments.length - 1] : ""
              } else {
                const chars = Array.from(e.target.value)
                newValue = chars.length > 0 ? chars[chars.length - 1] : ""
              }
              setSelectedEmoji(newValue)
            }}
            placeholder="הקלד אות או אימוג'י"
            className="border p-2 rounded"
          />
        </div>
      )}

      <Textarea
        placeholder={`${isEncoding ? "Encoded" : "Decoded"} output`}
        value={outputText}
        readOnly
        className="min-h-[100px]"
      />
      <div className="flex justify-end mt-2">
        <Button
          onClick={() => {
            navigator.clipboard.writeText(outputText)
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          העתק טקסט
        </Button>
      </div>
      {errorText && <div className="text-red-500 text-center">{errorText}</div>}
    </CardContent>
  )
}
