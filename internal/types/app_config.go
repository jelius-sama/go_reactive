package types

type AppConfig struct {
	Version string `json:"version,omitempty"`
	Title   string `json:"title,omitempty"`
	Port    string `json:"port,omitempty"`
	URL     string `json:"url,omitempty"`
}
