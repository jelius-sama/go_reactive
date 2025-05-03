package types

type SSRProps struct {
	DidEncounterInternalServerError bool      `json:"didEncounterInternalServerError"`
	ServerSideProps                 DataProps `json:"serverSideProps"`
}

type UserAssets struct {
	SignedAvatar string `json:"signed_avatar"`
	SignedBanner string `json:"signed_banner"`
}

type DataProps struct {
	UserAssets *UserAssets `json:"userAssets"`
	UserData   any         `json:"user,omitempty"`
	PageData   PageData    `json:"pageData"`
}

type PageData struct {
	Path     string `json:"path"`
	Data     any    `json:"data,omitempty"`
	MetaData Head   `json:"metadata"`
}

type Head struct {
	Title  string   `json:"title,omitempty"`
	Meta   []Meta   `json:"meta,omitempty"`
	Link   []Link   `json:"link,omitempty"`
	Script []Script `json:"script,omitempty"`
}

type Script struct {
	SRC     string `json:"src,omitempty"`
	Defer   bool   `json:"defer,omitempty"`
	Type    string `json:"type,omitempty"`
	Content string `json:"content,omitempty"`
}

type Link struct {
	Rel         string `json:"rel"`
	Href        string `json:"href"`
	Type        string `json:"type,omitempty"`
	Crossorigin string `json:"crossorigin,omitempty"`
}

type Meta struct {
	Name      string `json:"name,omitempty"`
	Content   string `json:"content,omitempty"`
	Property  string `json:"property,omitempty"`
	Charset   string `json:"charset,omitempty"`
	HttpEquiv string `json:"http-equiv,omitempty"`
}

type StaticRoute struct {
	Path   string   `json:"path"`
	Title  string   `json:"title,omitempty"`
	Meta   []Meta   `json:"meta,omitempty"`
	Link   []Link   `json:"link,omitempty"`
	Script []Script `json:"script,omitempty"`
}
