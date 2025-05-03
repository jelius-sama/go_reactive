package types

type Environment struct {
	Prod string
	Dev  string
}

var ENV = Environment{
	Prod: "production",
	Dev:  "development",
}
