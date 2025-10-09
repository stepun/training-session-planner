import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LoadLevelSlider } from '@/components/ui/load-level-slider'
import { useTrainingStore } from '@/store/trainingStore'
import { useTranslation } from '@/hooks/useTranslation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getLoadLevelGradientColor, getLoadLevelBgColor } from '@/utils/colorUtils'

export function GeneralDataForm() {
  const { session, updateSession } = useTrainingStore()
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('BLOCK_TITLE_GENERAL_DATA')}</CardTitle>
        <CardDescription>{t('BLOCK_DESCRIPTION_GENERAL_DATA')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sessionName">{t('FIELD_SESSION_NAME')}</Label>
          <Input
            id="sessionName"
            value={session.sessionName}
            onChange={(e) => updateSession({ sessionName: e.target.value })}
            placeholder={t('FIELD_SESSION_NAME_PLACEHOLDER')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">{t('FIELD_DATE')}</Label>
            <Input
              id="date"
              type="date"
              value={session.date}
              onChange={(e) => updateSession({ date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">{t('FIELD_TIME')}</Label>
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
            <Label htmlFor="duration">{t('FIELD_DURATION')}</Label>
            <Input
              id="duration"
              type="number"
              value={session.duration}
              onChange={(e) => updateSession({ duration: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="players">{t('FIELD_PLAYERS_COUNT')}</Label>
            <Input
              id="players"
              type="number"
              value={session.playersCount}
              onChange={(e) => updateSession({ playersCount: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="load">{t('FIELD_LOAD_LEVEL')}</Label>
            <div className="flex items-center gap-2">
              <span
                className="font-semibold text-sm"
                style={{ color: getLoadLevelGradientColor(session.loadLevel) }}
              >
                {session.loadLevel}/10
              </span>
              <div
                className="w-4 h-4 rounded-full border-2"
                style={{
                  backgroundColor: getLoadLevelBgColor(session.loadLevel),
                  borderColor: getLoadLevelGradientColor(session.loadLevel)
                }}
              />
            </div>
          </div>
          <LoadLevelSlider
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
          <Label htmlFor="equipment">{t('FIELD_EQUIPMENT')}</Label>
          <Input
            id="equipment"
            value={session.equipment}
            onChange={(e) => updateSession({ equipment: e.target.value })}
            placeholder={t('FIELD_EQUIPMENT_PLACEHOLDER')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="objectives">{t('FIELD_OBJECTIVES')}</Label>
          <Textarea
            id="objectives"
            value={session.objectives}
            onChange={(e) => updateSession({ objectives: e.target.value })}
            placeholder={t('FIELD_OBJECTIVES_PLACEHOLDER')}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clubLogo">{t('FIELD_CLUB_LOGO')}</Label>
          <Input
            id="clubLogo"
            type="url"
            value={session.clubLogoUrl}
            onChange={(e) => updateSession({ clubLogoUrl: e.target.value })}
            placeholder={t('FIELD_CLUB_LOGO_PLACEHOLDER')}
          />
        </div>
      </CardContent>
    </Card>
  )
}