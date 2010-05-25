require 'rake'
require 'rake/clean'

# You need this: http://code.google.com/closure/compiler/
COMPILER = 'closure' # or java -jar compiler.jar

task :default do
    minified = File.new(`mktemp -u`.strip, 'w')

    whole = File.read('system/minilol.js').lines.to_a
    whole.pop
    whole.insert(-1, *File.read('system/preparation.js').lines.to_a)
    whole.pop
    whole.insert(-1, *File.read('system/extension.js').lines.to_a)

    minified.write(whole.join(''))
    minified.close

    sh "#{COMPILER} --js '#{minified.path}' --js_output_file 'system/minilol.min.js'"
    sh "#{COMPILER} --js 'system/prototype.js' --js_output_file 'system/prototype.min.js'"
    sh "#{COMPILER} --js 'system/cookiejar.js' --js_output_file 'system/cookiejar.min.js'"
end
