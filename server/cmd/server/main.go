package main

import (
	"github.com/teoyi/dimewise/api"
	"github.com/teoyi/dimewise/config"
)

func main() {
	a := config.NewApp()
	s := api.NewAPI(a)
	s.Serve()
}
