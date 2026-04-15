import React from 'react';
import ChatScreen from '../../../src/modules/chat/screens/ChatScreen';
import { useProjectStore } from '../../../src/stores/projectStore';
import { View, Text } from 'react-native';
import { useTranslate, useAppTheme } from '../../../src/shared/hooks';

export default function ChatPageIndex() {
  const { activeProject } = useProjectStore();
  const { t } = useTranslate();
  const { theme } = useAppTheme();

  if (!activeProject) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-secondary-500 text-center">
          {t('chat.no_active_project', 'Debe seleccionar un proyecto para abrir el chat')}
        </Text>
      </View>
    );
  }

  return <ChatScreen projectId={activeProject.id} />;
}
