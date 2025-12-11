package httpx

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/euandresimoes/visualdb-go.git/internal/models"
)

func Require(w http.ResponseWriter, value any, name string) bool {
	switch v := value.(type) {

	case string:
		if v == "" {
			writeRequiredError(w, name)
			return false
		}

	case int:
		if v <= 0 {
			writeRequiredError(w, name)
			return false
		}

	case nil:
		writeRequiredError(w, name)
		return false
	}

	return true
}

func writeRequiredError(w http.ResponseWriter, name string) {
	w.WriteHeader(http.StatusBadRequest)
	json.NewEncoder(w).Encode(models.ApiResponse{
		Status:  http.StatusBadRequest,
		Message: fmt.Sprintf("%s is required", name),
	})
}
