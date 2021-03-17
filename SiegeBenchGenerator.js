(function () {
  const defaultConcurrency = 10
  const defaultTestingDuration = '10S'
  const defaultBenchmarkMode = true
  const defaultPrint = false

  var SiegeBenchGenerator = function () {
    this.defaultConcurrency = defaultConcurrency
    this.defaultTestingDuration = defaultTestingDuration
    this.defaultBenchmarkMode = defaultBenchmarkMode
    this.defaultPrint = defaultPrint
    var self = this

    this.generateCommand = function(request) {
      var command = `# ${request.name}\n`
      command += `siege -c${(self.options.concurrency || self.defaultConcurrency)}`

      // TIME
      if (self.options.testingDuration !== "" || this.defaultTestingDuration) {
        command += ` -t${self.options.testingDuration || this.defaultTestingDuration}`
      }
    
      // Benchmark mode
      if (self.options.benchmark !== false && this.defaultBenchmarkMode) {
        command += ' -b';
      }

      // Reps
      if (self.options.reps) {
        command += ` -r${self.options.reps}`
      }

      // Delay
      if (self.options.delay) {
        command += ` -d${self.options.delay}`
      }

      // Print
      if (self.options.print) {
        command += ' -p'
      }

      // header
      var headerName
      for (headerName in request.headers) {
        lowerHeader = headerName.toLowerCase()
        
        if (lowerHeader == 'content-type') {

          command += ` \\\n -T "${request.headers[headerName]}"`

        } else if (lowerHeader == 'user-agent') {

          command += ` \\\n -A "${request.headers[headerName]}"`

        } else {

          command += ` \\\n -H "${headerName}: ${request.headers[headerName]}"`

        }
      }

      // url, method, body
      command += ` \\\n '${request.url}`
      if (request.method != 'GET') {
        command += ` ${request.method}`
      }
      if (request.body) {
        command += ` ${request.body}`
      }
      command += "'"

      return command
    }

    this.generate = function(context, requests, options) {

      self.options = (options || {}).inputs || {}
    
      var commands = requests.map(function (request) {
        return self.generateCommand(request)
      });
      return commands.join('\n\n') + '\n'
    }
  }

  SiegeBenchGenerator.identifier = "io.github.anhoder.PawExtensions.SiegeBenchGenerator";
  SiegeBenchGenerator.title = "SiegeBench";
  SiegeBenchGenerator.fileExtension = "sh";
  SiegeBenchGenerator.languageHighlighter = "bash";
  SiegeBenchGenerator.inputs = [
    InputField("concurrency", "Concurrency", "Number", {
      persisted: true,
      defaultValue: defaultConcurrency,
      placeholder: "required",
      float: false,
      minValue: 1
    }),
    InputField("testingDuration", "Testing duration", "String", {
      persisted: true,
      defaultValue: defaultTestingDuration,
      placeholder: "not be used if blank",
    }),
    InputField("reps", "Reps", "Number", {
      persisted: true,
      placeholder: "not be used if blank",
      float: false,
      minValue: 1
    }),
    InputField("delay", "Delay(s)", "Number", {
      persisted: true,
      placeholder: "not be used if blank",
      float: false,
      minValue: 1
    }),
    InputField("benchmark", "Benchmark mode", "Checkbox", {
      persisted: true,
      defaultValue: defaultBenchmarkMode,
    }),
    InputField("print", "Print the entire page", "Checkbox", {
      persisted: true,
      defaultValue: defaultPrint,
    }),
  ]

  registerCodeGenerator(SiegeBenchGenerator)
}).call(this);
