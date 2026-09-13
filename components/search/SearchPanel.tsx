import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ViewStyle,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BLUE_ACTIVE, BLUE_INACTIVE } from "@/constants/theme";

const TEXT = "#11181C";
const MUTED = "#6b7280";
const CARD = "#ffffff";
const FIELD_BG = "#f7f8fa";
const PLACEHOLDER = "#9aa3af";
const DIVIDER = "#eceff3";
const DROPDOWN_PRESSED = "#e8f4ff";
const PIN_BG = "#E7F1FF";

export type SearchSuggestion = {
  key: string;
  title: string;
  subtitle?: string;
  caption?: string;
};

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

export function SearchPanel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SearchFieldDivider() {
  return <View style={styles.fieldDivider} />;
}

export function SearchField({
  label,
  placeholder,
  value,
  onChangeText,
  icon = "location-on",
  focused,
  onFocus,
  onBlur,
  editable = true,
  suggestions = [],
  showSuggestions = false,
  onSelectSuggestion,
  zIndex = 3,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: IconName;
  focused: boolean;
  onFocus: () => void;
  onBlur?: () => void;
  editable?: boolean;
  suggestions?: SearchSuggestion[];
  showSuggestions?: boolean;
  onSelectSuggestion?: (item: SearchSuggestion) => void;
  zIndex?: number;
}) {
  return (
    <View style={[styles.fieldWrap, { zIndex }]}>
      <Pressable
        style={[
          styles.stationField,
          {
            backgroundColor: FIELD_BG,
            borderColor: focused ? BLUE_ACTIVE : "transparent",
            borderWidth: focused ? 2 : 0,
            opacity: editable ? 1 : 0.55,
          },
        ]}
        onPress={() => {
          if (editable) onFocus();
        }}
      >
        <View style={styles.pinCircle}>
          <MaterialIcons name={icon} size={18} color={BLUE_ACTIVE} />
        </View>
        <View style={styles.fieldTextWrap}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder={placeholder}
            placeholderTextColor={PLACEHOLDER}
            value={value}
            editable={editable}
            onChangeText={onChangeText}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </View>
        <MaterialIcons name="chevron-right" size={22} color={MUTED} />
      </Pressable>
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <ScrollView
            style={styles.dropdownScroll}
            nestedScrollEnabled
            keyboardShouldPersistTaps="always"
          >
            {suggestions.map((item) => (
              <Pressable
                key={item.key}
                style={({ pressed }) => [
                  styles.dropdownItem,
                  { backgroundColor: pressed ? DROPDOWN_PRESSED : CARD },
                ]}
                onPress={() => onSelectSuggestion?.(item)}
              >
                <Text style={styles.dropdownItemText}>{item.title}</Text>
                {item.subtitle ? (
                  <Text style={styles.dropdownItemTextBn}>{item.subtitle}</Text>
                ) : null}
                {item.caption ? (
                  <Text style={styles.dropdownItemCaption}>{item.caption}</Text>
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export function SearchButton({
  label,
  enabled,
  onPress,
}: {
  label: string;
  enabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.searchButton,
        {
          backgroundColor: enabled ? BLUE_ACTIVE : BLUE_INACTIVE,
          opacity: pressed && enabled ? 0.85 : 1,
        },
      ]}
      onPress={onPress}
      disabled={!enabled}
    >
      <MaterialIcons name="search" size={20} color="#fff" />
      <Text style={styles.searchButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD,
    marginHorizontal: 16,
    borderRadius: 22,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 4,
    overflow: "visible",
  },
  fieldWrap: {
    position: "relative",
    zIndex: 3,
  },
  stationField: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PIN_BG,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  fieldTextWrap: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: MUTED,
  },
  fieldInput: {
    fontSize: 15,
    fontWeight: "600",
    paddingVertical: 2,
    paddingHorizontal: 0,
    color: TEXT,
  },
  fieldDivider: {
    height: 1,
    backgroundColor: DIVIDER,
    marginVertical: 8,
    marginLeft: 56,
  },
  dropdown: {
    position: "absolute",
    top: 64,
    left: 0,
    right: 0,
    borderWidth: 2,
    borderColor: BLUE_ACTIVE,
    borderRadius: 12,
    maxHeight: 200,
    zIndex: 30,
    elevation: 20,
    backgroundColor: CARD,
    overflow: "hidden",
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT,
  },
  dropdownItemTextBn: {
    fontSize: 13,
    marginTop: 2,
    color: MUTED,
  },
  dropdownItemCaption: {
    fontSize: 12,
    marginTop: 2,
    color: MUTED,
  },
  searchButton: {
    marginTop: 14,
    borderRadius: 14,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    zIndex: 0,
    elevation: 0,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
