import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';

interface DynamicTableProps {
  data: Record<string, any>[];
  columns?: string[];
  title?: string;
  isLoading?: boolean;
  maxRows?: number;
  columnWidths?: Record<string, number>;
}

/**
 * DynamicTable Component
 * 
 * Automatically maps data from JSON/CSV arrays
 * - Extracts keys from first object if columns not provided
 * - Handles missing values gracefully
 * - Uses zebra-striping for rows
 * - Horizontal scroll for many columns
 * - Sticky header with contrasting background
 */
export const DynamicTable: React.FC<DynamicTableProps> = ({
  data,
  columns,
  title,
  isLoading = false,
  maxRows = 10,
  columnWidths = {},
}) => {
  // Extract columns from data if not provided
  const TableColumns = useMemo(() => {
    if (columns) return columns;
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data, columns]);

  // Format cell value
  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }

    if (typeof value === 'number') {
      // Format large numbers with commas
      if (Number.isInteger(value)) {
        return value.toLocaleString();
      }
      // Format decimals to 2 places
      return parseFloat(value.toFixed(2)).toLocaleString();
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    if (typeof value === 'object') {
      return JSON.stringify(value).substring(0, 50) + '...';
    }

    return String(value).substring(0, 100);
  };

  // Calculate column width
  const getColumnWidth = (column: string): number => {
    return columnWidths[column] || Math.max(80, column.length * 8 + 16);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const displayData = data.slice(0, maxRows);
  const totalWidth = TableColumns.reduce((sum, col) => sum + getColumnWidth(col), 0);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        scrollEventThrottle={16}
        nestedScrollEnabled
      >
        <View style={{ minWidth: totalWidth || '100%' }}>
          {/* Header Row - Sticky */}
          <View style={styles.header}>
            {TableColumns.map((column, idx) => (
              <View
                key={`header-${idx}`}
                style={[
                  styles.headerCell,
                  { width: getColumnWidth(column) },
                ]}
              >
                <Text style={styles.headerText} numberOfLines={2}>
                  {column}
                </Text>
              </View>
            ))}
          </View>

          {/* Body Rows with Zebra Striping */}
          <FlatList
            data={displayData}
            keyExtractor={(item, idx) => `row-${JSON.stringify(item)}-${idx}`}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <View
                style={[
                  styles.row,
                  {
                    backgroundColor:
                      index % 2 === 0
                        ? Colors.background
                        : 'rgba(52, 65, 85, 0.3)',
                  },
                ]}
              >
                {TableColumns.map((column, colIdx) => (
                  <View
                    key={`cell-${index}-${colIdx}`}
                    style={[
                      styles.cell,
                      { width: getColumnWidth(column) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.cellText,
                        item[column] === null || item[column] === undefined
                          ? styles.cellTextEmpty
                          : styles.cellTextNormal,
                      ]}
                      numberOfLines={3}
                    >
                      {formatCellValue(item[column])}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          />
        </View>
      </ScrollView>

      {/* Footer Info */}
      {data.length > maxRows && (
        <Text style={styles.footerText}>
          Showing {maxRows} of {data.length} rows
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.card,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderBottomWidth: 2,
    borderBottomColor: Colors.accent,
  },
  headerCell: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 184, 77, 0.1)',
  },
  headerText: {
    color: Colors.accent,
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 16,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 65, 85, 0.2)',
  },
  cell: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 184, 77, 0.05)',
  },
  cellText: {
    fontSize: 12,
    lineHeight: 16,
  },
  cellTextNormal: {
    color: Colors.text,
  },
  cellTextEmpty: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 11,
    paddingHorizontal: 16,
    paddingVertical: 10,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.card,
  },
});

export default DynamicTable;
