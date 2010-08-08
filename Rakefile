require 'rake'
require 'rake/clean'

# You need this: http://code.google.com/closure/compiler/
COMPILER = 'closure' # or java -jar compiler.jar

def minify (file, out=nil)
    if !File.exists?(file)
        return
    end

    if !out
        out = file.clone; out[out.length - 3, 3] = '.min.js'
    end

    if !File.exists?(out) || File.mtime(file) > File.mtime(out)
        sh "#{COMPILER} --js '#{file}' --js_output_file '#{out}'"
    end
end

task :default do
    minified = File.new(`mktemp -u`.strip, 'w')

    whole = File.read('system/miniLOL.js').lines.to_a
    whole.pop
    whole.pop
    whole.insert(-1, *File.read('system/Resource.js').lines.to_a)
    whole.insert(-1, *File.read('system/preparation.js').lines.to_a)
    whole.pop
    whole.insert(-1, *File.read('system/extensions.js').lines.to_a)

    minified.write(whole.join(''))
    minified.close

    minify(minified.path, 'system/miniLOL.min.js')
    minify('system/prototype.js')
    minify('system/cookiejar.js')
end
