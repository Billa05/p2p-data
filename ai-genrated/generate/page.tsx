"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const moods = ["Happy", "Sad", "Energetic", "Relaxed", "Focused"]
const genres = ["Pop", "Rock", "Hip Hop", "Electronic", "Classical", "Jazz"]

export default function GeneratePage() {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  const handleMoodChange = (mood: string) => {
    setSelectedMoods((prev) => (prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]))
  }

  const handleGenreChange = (genre: string) => {
    setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]))
  }

  const handleSubmit = () => {
    // Here you would typically make an API call to generate the playlist
    console.log("Generating playlist with:", { selectedMoods, selectedGenres })
    // For now, we'll just redirect to a mock results page
    window.location.href = "/results"
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Generate Your Playlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-gray-900 text-white">
          <CardHeader>
            <CardTitle>Select Moods</CardTitle>
          </CardHeader>
          <CardContent>
            {moods.map((mood) => (
              <div key={mood} className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id={`mood-${mood}`}
                  checked={selectedMoods.includes(mood)}
                  onCheckedChange={() => handleMoodChange(mood)}
                />
                <label htmlFor={`mood-${mood}`}>{mood}</label>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="bg-gray-900 text-white">
          <CardHeader>
            <CardTitle>Select Genres</CardTitle>
          </CardHeader>
          <CardContent>
            {genres.map((genre) => (
              <div key={genre} className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id={`genre-${genre}`}
                  checked={selectedGenres.includes(genre)}
                  onCheckedChange={() => handleGenreChange(genre)}
                />
                <label htmlFor={`genre-${genre}`}>{genre}</label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Button onClick={handleSubmit} className="mt-8 bg-green-500 hover:bg-green-600 text-white">
        Generate Playlist
      </Button>
    </div>
  )
}

