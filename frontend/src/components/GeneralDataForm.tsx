import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { useTrainingStore } from '@/store/trainingStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function GeneralDataForm() {
  const { session, updateSession } = useTrainingStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Data</CardTitle>
        <CardDescription>Enter training session information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sessionName">Session Name</Label>
          <Input
            id="sessionName"
            value={session.sessionName}
            onChange={(e) => updateSession({ sessionName: e.target.value })}
            placeholder="TRAINING SESSION MD+2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={session.date}
              onChange={(e) => updateSession({ date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={session.time}
              onChange={(e) => updateSession({ time: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={session.duration}
              onChange={(e) => updateSession({ duration: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="players">Number of Players</Label>
            <Input
              id="players"
              type="number"
              value={session.playersCount}
              onChange={(e) => updateSession({ playersCount: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="load">Load Level: {session.loadLevel}/10</Label>
          <Slider
            id="load"
            min={1}
            max={10}
            step={1}
            value={[session.loadLevel]}
            onValueChange={(value) => updateSession({ loadLevel: value[0] })}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="equipment">Equipment</Label>
          <Input
            id="equipment"
            value={session.equipment}
            onChange={(e) => updateSession({ equipment: e.target.value })}
            placeholder="Chips, bibs, cones, dummies, small goals (4), large portable goals"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="objectives">Objectives</Label>
          <Textarea
            id="objectives"
            value={session.objectives}
            onChange={(e) => updateSession({ objectives: e.target.value })}
            placeholder="Technical-Tactical focus"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clubLogo">Club Logo URL</Label>
          <Input
            id="clubLogo"
            type="url"
            value={session.clubLogoUrl}
            onChange={(e) => updateSession({ clubLogoUrl: e.target.value })}
            placeholder="https://example.com/logo.png"
          />
        </div>
      </CardContent>
    </Card>
  )
}