require 'rake'
require 'rake/clean'

# You need this: http://code.google.com/closure/compiler/
COMPILER = 'closure-compiler'

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

    updated = false
    ['miniLOL', 'Resource', 'preparation', 'extensions'].each {|file|
        if File.mtime("system/#{file}.js") >= File.mtime('system/miniLOL.min.js')
            updated = true
            break
        end
    }

    if updated
        whole = File.read('system/miniLOL.js').lines.to_a
        whole.pop 4
        whole.insert(-1, *File.read('system/Resource.js').lines.to_a)
        whole.insert(-1, *File.read('system/Storage.js').lines.to_a)
        whole.insert(-1, *File.read('system/preparation.js').lines.to_a)
        whole.pop
        whole.insert(-1, *File.read('system/extensions.js').lines.to_a)

        minified.write(whole.join(''))
        minified.close

        minify(minified.path, 'system/miniLOL.min.js')
    end

    minify('system/prototype.js')
    minify('system/cookiejar.js')
    minify('system/jstorage.js');
    minify('system/xpath.js')

    updated       = false
    scriptaculous = ['effects', 'builder', 'sound', 'slider', 'controls', 'dragdrop']

    scriptaculous.each {|file|
        if File.mtime("system/scriptaculous/#{file}.js") >= File.mtime('system/scriptaculous.min.js')
            updated = true
            break
        end
    }

    if updated
        minified = File.new(`mktemp -u`.strip, 'w')
        scriptaculous.each {|file|
            minified.write(File.read("system/scriptaculous/#{file}.js"))
        }
        minified.close

        minify(minified.path, 'system/scriptaculous.min.js')
    end
end
