import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';

class FilesTab extends StatefulWidget {
  const FilesTab({super.key});

  @override
  State<FilesTab> createState() => _FilesTabState();
}

class _FilesTabState extends State<FilesTab> {
  final List<PlatformFile> _files = [];

  void _pickFiles() async {
    final result = await FilePicker.platform.pickFiles(allowMultiple: true);
    if (result != null) {
      setState(() {
        _files.addAll(result.files);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: ElevatedButton.icon(
            onPressed: _pickFiles,
            icon: const Icon(Icons.upload_file),
            label: const Text('Select Files to Share'),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 50),
            ),
          ),
        ),
        Expanded(
          child: _files.isEmpty
              ? const Center(child: Text('No files shared yet'))
              : ListView.builder(
                  itemCount: _files.length,
                  itemBuilder: (context, index) {
                    final file = _files[index];
                    return ListTile(
                      leading: const Icon(Icons.insert_drive_file),
                      title: Text(file.name),
                      subtitle: Text('${(file.size / 1024).toStringAsFixed(2)} KB'),
                      trailing: IconButton(
                        icon: const Icon(Icons.share),
                        onPressed: () {
                          // Trigger WebRTC transfer
                        },
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
