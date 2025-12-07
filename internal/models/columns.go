package models

type ColumnModel struct {
	Name          string  `json:"column_name"`
	DataType      string  `json:"data_type"`
	IsNullable    *string `json:"is_nullable"`
	ColumnDefault *string `json:"column_default"`
}
